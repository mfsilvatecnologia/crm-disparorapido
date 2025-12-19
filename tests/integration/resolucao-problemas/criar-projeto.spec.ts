describe('Criar projeto', () => {
  it('deve criar um projeto sem metodologia', () => {
    cy.visit('/app/projetos/novo')

    cy.get('input[name="titulo"]').type('Investigar defeitos na linha de producao')
    cy.get('textarea[name="descricao"]').type('Analise de defeitos recorrentes identificados no setor de montagem')
    cy.get('input[name="cliente_id"]').type('Cliente XYZ')
    cy.get('input[name="responsavel_id"]').type('Joao Silva')
    cy.get('input[name="data_inicio"]').type('2025-12-18')

    cy.contains('button', /criar projeto/i).click()

    cy.contains(/projeto criado com sucesso/i).should('be.visible')
    cy.contains('Investigar defeitos na linha de producao').should('be.visible')
    cy.contains(/metodologia pendente/i).should('be.visible')
  })
})
