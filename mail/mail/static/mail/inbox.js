document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").addEventListener('submit',sendEmail)
  
  // By default, load the inbox :
  // This means that at first the Index page will always be loaded, and then the matter will depend on clicks according to the above commands.
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
    emails.forEach(email => {
      const new_email = document.createElement('div');
      new_email.className = "list-group-item"
      new_email.innerHTML = `<h5>sender: ${email.sender}</h5>
      <h4>subject:${email.subject}</h4>
      <p>${email.timestamp}</p>`;

      new_email.className = email.read ? "read" : "unread";
      new_email.addEventListener('click', function(){
          viewEmail(email.id)
      }); 
      document.querySelector('#emails-view').append(new_email);
    })
});

}


function sendEmail(event) {
  event.preventDefault();
  console.log("sendEmail is working")
  
  const recipients = document.querySelector("#compose-recipients").value
    const subject = document.querySelector("#compose-subject").value
    const body = document.querySelector("#compose-body").value
    console.log(recipients , subject , body)
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent')
    });

}

function viewEmail(id) {
  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-detail-view').style.display = 'block';

    document.querySelector('#emails-detail-view').innerHTML = `
    <ul class="list-group">
  <li class="list-group-item"><b>FROM:</b>${email.sender}</li>
  <li class="list-group-item"><b>TO:</b>${email.recipients}</li>
  <li class="list-group-item"><b>subject:</b>${email.subject}</li>
  <li class="list-group-item"><b>Timestapme:</b>${email.timestamp}</li>
  <li class="list-group-item"><b>Message:</b>${email.body}</li>
</ul>`

if(!email.read){
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

// Archive and Unarchive :
const element = document.createElement('button');
element.innerHTML = email.archived ? "unarchived" : "archive"
element.className = email.archived ? "green" : "red"
element.addEventListener('click', function() {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !email.archived
    })
  })
  .then(()=> { load_mailbox("archive")})
});
document.querySelector('#emails-detail-view').append(element);

// replay :
const reply = document.createElement('button');
reply.innerHTML = "reply"
reply.className = "reply-btn"
reply.addEventListener('click', function() {
  compose_email()
  document.querySelector('#compose-recipients').value = email.sender;
  let subject = email.subject
  if(subject.split(" ",1)[0] != "Re:"){
    subject = "Re: " + email.subject
  }
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = `on ${email.timestamp} ${email.sender} wrote: ${email.body}`;
});
document.querySelector('#emails-detail-view').append(reply);

});
}