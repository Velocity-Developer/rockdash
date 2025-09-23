// utils/isInPWA.ts
export function isInPWA() {
    return (
        window.matchMedia('(display-mode: standalone)').matches || 
        ('standalone' in window.navigator && (window.navigator as any).standalone === true)
    );
}