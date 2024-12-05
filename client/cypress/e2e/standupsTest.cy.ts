describe('Standups Page End-to-End Test', () => {

    beforeEach(() => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/login', 
        body: {
          email: 'TestEmail@fau.de',
          password: 'TestPassword123',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        window.localStorage.setItem('token', response.body.token);
        window.localStorage.setItem('username', 'Test User');  
      });
    });
  
    it('should navigate to /standups, fill in standups details, and send the email', () => {
      cy.visit('/dashboard');
      
      cy.get('.SelectTriggerProject').should('exist').click();
      cy.get('.SelectContentProject', { timeout: 5000 })  
      .should('exist')
      .within(() => {

        cy.log('Checking project options');
        cy.get('.SelectItem').each(($el) => {
          cy.log($el.text());
        });

        cy.contains('.SelectItem', 'Best Project').click();  
      });
      cy.visit('/standups');
  
      cy.get('.DashboardContainerStandups h1').should('contain.text', 'Standup Emails');
  
      cy.get('textarea.DoneContainer').type('Completed tasks for the project.');
      cy.get('textarea.PlansContainer').type('Plan to finish the new feature.');
      cy.get('textarea.ChallengesContainer').type('Encountered some API issues.');
  
      cy.get('.SendButton').click();
  
      cy.window().then((win) => {
        cy.stub(win.location, 'reload').as('pageReload');
      });
      cy.get('@pageReload').should('have.been.called');
    });
  });
  