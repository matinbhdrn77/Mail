'use strict';

// Select Elements 
const tableBodyEl = document.getElementById('table-body')

// Select Views 
const emailsView = document.querySelector('#emails-view')
const composeView = document.querySelector('#compose-view')
const emailView = document.querySelector('#email-view')

// Use buttons to toggle between views (event delegation)
document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
document.querySelector("#compose").addEventListener("click", compose_email);

// listen to each email-box and if click load that email
tableBodyEl.addEventListener('click', function(e) {
  if (e.target.parentElement.classList.contains('email-box')) {
    let id = e.target.parentElement.dataset.emailId
    fetch('/emails/' + parseInt(id))
    .then(response => response.json())
    .then(email => {
      load_email(email)
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
  emailView.style.display = 'none';
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
  emailView.style.display = 'none';

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

function load_email(email) {

  // Show the mailbox and hide other views
  emailsView.style.display = 'none';
  composeView.style.display = 'none';
  emailView.style.display = 'block';

  // create div for every element
  const from = document.createElement('div')
  const to = document.createElement('div')
  const subject = document.createElement('div')
  const timestamp = document.createElement('div')
  const body = document.createElement('div')
  const hr = document.createElement('hr')
  const replyBtn = document.createElement('button')
  const archiveBtn = document.createElement('button')

  // content for the elements
  from.innerHTML = `<strong>From: </strong>${email.sender}`
  to.innerHTML = `<strong>To: </strong>${email.recipients.join(', ')}`
  subject.innerHTML = `<strong>Subject: </strong>${email.subject}`
  timestamp.innerHTML = `<strong>Time: </strong>${email.timestamp}`
  body.innerHTML = `${email.body}`
  // reply button
  replyBtn.textContent = 'Reply'
  replyBtn.classList = 'btn btn-sm btn-outline-primary margin-right margin-top'
  replyBtn.addEventListener('click', reply_email(email))
  // archive button
  archiveBtn.textContent = email.archived ? 'Unarchive' : 'Archive'
  archiveBtn.classList = 'btn btn-sm btn-outline-primary margin-top'
  archiveBtn.addEventListener('click', function(e) {
    handle_archive_email(email)
    // e.target.textContent
  })
  

  // add elements to DOM
  const elements = [from, to, subject, timestamp, replyBtn, archiveBtn, hr, body]
  elements.forEach(element => emailView.append(element))
}

function reply_email(email) {
  console.log('email replied')
}

function handle_archive_email(email) {
  console.log('email archiving handeled')
}