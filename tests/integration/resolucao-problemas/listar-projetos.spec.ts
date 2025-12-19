describe('Listar projetos', () => {
  it('deve listar, filtrar e paginar projetos', () => {
    cy.visit('/app/projetos')

    cy.get('input[name="busca"]').type('defeitos')
    cy.contains('button', /filtrar/i).click()

    cy.contains(/resultados/i).should('be.visible')

    cy.contains('button', /proxima/i).click()
    cy.contains(/pagina 2/i).should('be.visible')
  })
})
