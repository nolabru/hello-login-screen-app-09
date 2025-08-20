// Script para contornar verificação de email temporariamente
// Modificamos o localStorage para simular email verificado

console.log('🔧 Configurando bypass de verificação de email...');

// Simular que o email foi verificado localmente
if (typeof window !== 'undefined') {
  localStorage.setItem('emailVerified', 'true');
  localStorage.setItem('bypassEmailVerification', 'true');
  localStorage.setItem('adminUserEmail', 'admin.blue@bluesaude.com');
  
  console.log('✅ Bypass configurado!');
  console.log('📝 Flags setadas:');
  console.log('  - emailVerified: true');
  console.log('  - bypassEmailVerification: true');
  console.log('  - adminUserEmail: admin.blue@bluesaude.com');
} else {
  console.log('⚠️  Execute este script no navegador ou use a modificação no código.');
}

console.log();
console.log('🌐 Abra o navegador em http://localhost:8082 e execute este script no console:');
console.log();
console.log('localStorage.setItem("emailVerified", "true");');
console.log('localStorage.setItem("bypassEmailVerification", "true");');
console.log('localStorage.setItem("adminUserEmail", "admin.blue@bluesaude.com");');
console.log('location.reload();');
console.log();
console.log('Depois tente fazer login normalmente.');
