'use strict';

// Select Elements 
const tableBodyEl = document.getElementById('table-body')

// Select Views 
const emailsView = document.querySelector('#emails-view')
const composeView = document.querySelector('#compose-view')

// Use buttons to toggle between views (event delegation)
document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
document.querySelector("#compose").addEventListener("click", compose_email);

// listen to each email-box
tableBodyEl.addEventListener('click', function(e) {
  if (e.target.parentElement.classList.contains('email-box')) {
    let id = e.target.parentElement.dataset.emailId
    console.log(id)
    fetch('/emails/' + parseInt(id))
    .then(response => response.json())
    .then(email => {
    // Print email
    console.log(email);
    });
  }
})

// By default, load the inbox
load_mailbox('inbox');

// Send A Email
document.getElementById('compose-form').addEventListener('submit', (e) => submit_form(e))


function submit_form(e) {
  e.preventDefault()
  const form = e.target
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: form.elements['compose-recipients'].value,

      subject: form.elements['compose-subject'].value,
      body: form.elements['compose-body'].value
    })
  })
    .then(response => response.json())
    .then(result => {
      // Alert result
      const messageDiv = document.getElementById('message-div');
      const alertMassegeEl = document.createElement('div')
      alertMassegeEl.role = "alert"

      if (result.error) {
        alertMassegeEl.textContent = result.error
        alertMassegeEl.classList = 'alert alert-danger'
        messageDiv.append(alertMassegeEl)
      } else {
        alertMassegeEl.textContent = result.message
        alertMassegeEl.classList = 'alert alert-success'
        setTimeout(function(){
          alertMassegeEl.remove();
          },3000);
        messageDiv.append(alertMassegeEl)
        load_mailbox('sent');
      }
    });
}

function compose_email() {

  // Show compose view and hide other views
  emailsView.style.display = 'none';
  composeView.style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  emailsView.style.display = 'block';
  composeView.style.display = 'none';

  // Show the mailbox name
  const header = document.getElementById('header')
  header.textContent = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`

  tableBodyEl.innerHTML = ''
  // Retrive Emials
  fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => {
    // Full table Body with emails
    emails.forEach(email => {
      const html = `
        <tr class="${email.read ? 'read' : 'unread'} email-box" data-email-id="${email.id}">
          <th>
            ${mailbox === "sent" ? email.recipients.join(", ") : email.sender}
          </th>
          <td>${email.subject}</td>
          <td>${email.timestamp}</td>
        </tr>
      `
      tableBodyEl.insertAdjacentHTML('beforeend', html)

    });
  });
}