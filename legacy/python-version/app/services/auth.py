"""
Sistema de autenticação e gerenciamento de sessões.
Mantém a mesma lógica do auth.js, mas rodando no servidor Python.
"""

import json
import secrets
import time
from typing import Dict, Optional


# Credenciais padrão (em produção, usar banco de dados + hash)
DEFAULT_CREDENTIALS = {
    "username": "admin",
    "password": "admin123"
}

# Armazenamento de sessões em memória
_sessions: Dict[str, Dict] = {}

# Duração da sessão em segundos (2 horas)
SESSION_TIMEOUT = 2 * 60 * 60

# Chave para cookie de sessão
SESSION_COOKIE_NAME = "admin_session_id"


def login_user(username: str, password: str) -> Dict:
    """
    Autentica um usuário e cria uma sessão.
    
    Args:
        username: Nome de usuário
        password: Senha
        
    Returns:
        Dicionário com sucesso e mensagem, ou erro
    """
    if username == DEFAULT_CREDENTIALS["username"] and \
       password == DEFAULT_CREDENTIALS["password"]:
        # Criar nova sessão
        session_id = generate_session_id()
        session_data = {
            "username": username,
            "timestamp": time.time(),
            "token": generate_token(),
            "session_id": session_id
        }
        _sessions[session_id] = session_data
        
        return {
            "success": True,
            "message": "Login realizado com sucesso!",
            "session_id": session_id
        }
    
    return {
        "success": False,
        "message": "Usuário ou senha incorretos"
    }


def is_user_logged_in(session_id: Optional[str]) -> bool:
    """
    Verifica se um usuário está logado e sua sessão é válida.
    
    Args:
        session_id: ID da sessão a verificar
        
    Returns:
        True se sessão é válida, False caso contrário
    """
    if not session_id or session_id not in _sessions:
        return False
    
    session = _sessions[session_id]
    current_time = time.time()
    session_age = current_time - session["timestamp"]
    
    # Verificar se sessão expirou
    if session_age > SESSION_TIMEOUT:
        logout_user(session_id)
        return False
    
    # Atualizar timestamp para estender a sessão
    session["timestamp"] = current_time
    return True


def logout_user(session_id: Optional[str]) -> bool:
    """
    Faz logout de um usuário removendo sua sessão.
    
    Args:
        session_id: ID da sessão a remover
        
    Returns:
        True se logout foi bem-sucedido
    """
    if session_id and session_id in _sessions:
        del _sessions[session_id]
        return True
    return False


def get_current_session(session_id: Optional[str]) -> Optional[Dict]:
    """
    Obtém os dados da sessão atual.
    
    Args:
        session_id: ID da sessão
        
    Returns:
        Dados da sessão ou None
    """
    if not session_id or session_id not in _sessions:
        return None
    
    session = _sessions[session_id]
    current_time = time.time()
    session_age = current_time - session["timestamp"]
    
    # Verificar expiração
    if session_age > SESSION_TIMEOUT:
        logout_user(session_id)
        return None
    
    return session


def get_session_from_cookies(headers: Dict[str, str]) -> Optional[str]:
    """
    Extrai o session_id dos cookies da requisição.
    
    Args:
        headers: Dicionário de headers HTTP
        
    Returns:
        session_id ou None
    """
    cookies_header = headers.get("Cookie", "")
    
    for cookie in cookies_header.split(";"):
        cookie = cookie.strip()
        if cookie.startswith(f"{SESSION_COOKIE_NAME}="):
            return cookie.split("=", 1)[1]
    
    return None


def generate_session_id() -> str:
    """Gera um ID de sessão seguro."""
    return secrets.token_urlsafe(32)


def generate_token() -> str:
    """Gera um token seguro."""
    return f"token_{secrets.token_urlsafe(16)}"


def require_auth(handler) -> Optional[Dict]:
    """
    Middleware para proteger rotas que requerem autenticação.
    
    Args:
        handler: Handler HTTP
        
    Returns:
        Dados da sessão se autenticado, None caso contrário
    """
    session_id = get_session_from_cookies(handler.headers)
    
    if not session_id or not is_user_logged_in(session_id):
        return None
    
    return get_current_session(session_id)


def cleanup_expired_sessions():
    """Remove todas as sessões expiradas."""
    current_time = time.time()
    expired = [
        sid for sid, session in _sessions.items()
        if current_time - session["timestamp"] > SESSION_TIMEOUT
    ]
    
    for sid in expired:
        del _sessions[sid]
    
    return len(expired)
