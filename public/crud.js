// set up listener on delete forms
var deleteForms = document.getElementsByClassName("delete-form");
setDeleteFormListenerOn(deleteForms);

var newWorkoutForm = document.getElementById("create-workout");
var populateForm = document.getElementById("populate-form");

// populate test data in form if desired
populateForm.addEventListener("submit", function(event) {
  event.preventDefault();
  populateWorkoutFieldsIn(newWorkoutForm);
});

// create a new workout when form is submitted
newWorkoutForm.addEventListener("submit", function(event) {
  event.preventDefault();
  var newWorkoutPost = new XMLHttpRequest();
  newWorkoutPost.open("POST", "/workouts", true);
  newWorkoutPost.setRequestHeader("Content-Type", "application/json");

  // retrieve data from the form
  newWorkoutData = buildWorkoutObjectFrom(newWorkoutForm);

  // display error if invalid
  if (newWorkoutData.name == "") {
    alert("Name cannot be blank.");
    return;
  }

  // build HTML and add it to the table if creation is
  // successful
  newWorkoutPost.addEventListener("load", function() {
    if (newWorkoutPost.responseText == "ERROR") {
      alert("Error creating workout. Please try again.");
      return;
    }
    newWorkoutForm.reset();
    var id = newWorkoutPost.responseText;
    buildTableRowFor(newWorkoutData, id);    
  });
  newWorkoutPost.send(JSON.stringify(newWorkoutData));
});

// HELPERS /////////////////////////////////

function buildTableRowFor(workoutData, id) {
    var newTr = buildWorkoutTr(newWorkoutData);
    // add edit button
    buildEditButtonFor(newTr, id);
    // add delete button
    buildDeleteFormFor(newTr, id);
}

// pull data from new workout form fields
function buildWorkoutObjectFrom(form) {
  var workoutObj = {
    name: form.elements['name'].value,
    reps: form.elements['reps'].value,
    weight: form.elements['weight'].value,
    date: form.elements['date'].value,
    lbs: form.elements['lbs'].checked
  };
  return workoutObj;
}

// delete a workout of a given ID
function deleteWorkout(idToDelete) {
  var deleteRequest = new XMLHttpRequest();
  deleteRequest.open("POST", "/workouts/" + idToDelete + "?_method=DELETE", true);
  deleteRequest.addEventListener("load", function() {
    // handle backend errors
    if (deleteRequest.responseText == "ERROR") {
      alert("Error deleting workout. Please try again.");
      return;
    }
    // remove the tr of the deleted item
    var trToDelete = document.getElementById("workout-tr-" + idToDelete);
    trToDelete.parentNode.removeChild(trToDelete);
  });
  deleteRequest.send(null);
};

// build a delete form for a workout
function buildDeleteFormFor(newTr, id) {
  // build form
  var deleteForm = document.createElement("form");
  deleteForm.setAttribute("action", "javascript:");
  deleteForm.classList.add("delete-form");

  // set form listener
  setDeleteFormListenerOn([deleteForm]);

  // set up hidden ID field
  var hiddenField = document.createElement("input");
  hiddenField.setAttribute("type", "hidden");
  hiddenField.setAttribute("value", id);
  hiddenField.setAttribute("name", "id");
  deleteForm.appendChild(hiddenField);

  // set up submit button
  var submitButton = document.createElement("button");
  submitButton.setAttribute("type", "submit");
  submitButton.textContent = "Delete";

  // add a new td and append it to the new tr
  var deleteTd = document.createElement("td");
  deleteForm.appendChild(submitButton);
  deleteTd.appendChild(deleteForm);
  newTr.appendChild(deleteTd);
  newTr.setAttribute("id", "workout-tr-" + id);
}

// build an edit button for a new workout
function buildEditButtonFor(newTr, id) {
  var editTd = document.createElement("td");
  var editLink = document.createElement("a");
  editLink.setAttribute("href", "/workouts/" + id + "/edit");
  editLink.textContent = "Edit";
  editLink.classList.add("button");
  editTd.appendChild(editLink);
  newTr.appendChild(editTd);
}

// build an individual workout entry for the table
function buildWorkoutTr(newWorkoutData) {
  var tableBody = document.getElementsByTagName("tbody")[0];
  var newTr = document.createElement("tr");
  tableBody.appendChild(newTr);    
  Object.keys(newWorkoutData).forEach(function(key, index) {
    var newTd = document.createElement("td");
    newTd.textContent = newWorkoutData[key];
    newTr.appendChild(newTd);
  });
  return newTr;
}   

function setDeleteFormListenerOn(forms) {
  for (var i=0; i < forms.length; i++) {
    forms[i].addEventListener("submit", function(event) {
      var idToDelete = event.target.elements['id'].value;
      deleteWorkout(idToDelete);
    });
  }
}

// populate workout form fields
function populateWorkoutFieldsIn(form) {
  form.elements['name'].value = "Test name";
  form.elements['reps'].value = Math.floor((Math.random() * 50) + 1);;
  form.elements['weight'].value = Math.floor((Math.random() * 150) + 1);;;
  form.elements['date'].value = '2010-10-10';
}
