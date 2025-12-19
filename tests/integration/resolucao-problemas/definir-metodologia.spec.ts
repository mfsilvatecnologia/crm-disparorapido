describe('Definir metodologia', () => {
  it('deve definir metodologia MASP e criar etapas', () => {
    cy.visit('/app/projetos/123')

    cy.contains('button', /definir metodologia/i).click()
    cy.contains('label', /masp/i).click()
    cy.contains('button', /confirmar/i).click()

    cy.contains(/metodologia masp/i).should('be.visible')
    cy.contains(/etapas/i).should('be.visible')
  })
})
