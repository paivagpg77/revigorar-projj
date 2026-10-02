/**
 * Seeds de demonstração desativados.
 * O ambiente real do REVIGORAR deve iniciar vazio e receber apenas
 * usuários, pacientes e registros criados pela aplicação.
 */
async function seed() {
  console.log('Seed de demonstração desativado: nenhum dado fictício foi inserido.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
