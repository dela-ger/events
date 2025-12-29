export function signOut() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}