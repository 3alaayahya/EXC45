let mode;
let coursesLength = 0;
let coursesData = [];
let courseInList;
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

$(document).ready(function () {
    //let port = "7294";
    getCourses();

    $('#quickEditBtn').on('click', function () {
        toggleDataList();
    });

    $('#editCourseBtn').on('click', function () {
        mode = "edit";
        const courseId = $('#courseDatalist').val();
        console.log("Edit course button clicked, course ID: ", courseId);
        $('#courseID').prop('readonly', true);
        $('#courseInstructorId').prop('readonly', true);
        if (courseId) {
            fetchCourseDetails(courseId);
        } else {
            alert("Please enter a course ID.");
        }
    });

    $('#insertCourseBtn').on('click', function () {
        mode = "insert";
        clearForm();
        $('#courseID').prop('readonly', true);
        $('#courseID').val(coursesLength); // Set courseID to coursesLength
        $('#courseInstructorId').prop('readonly', false);
        $('#formMode').val('insert');
        showModal();
    });

    // Handle edit button click event to open edit modal
    $('#coursesTable').on('click', '.edit-course-list', function () {
        event.preventDefault();
        var data = $('#coursesTable').DataTable().row($(this).parents('tr')).data();
        courseInList = data;
        $('#editCourseId').val(data.id);
        $('#editCourseTitle').val(data.title1);
        $('#editCourseIsActive').prop('checked', data.isActive);
        $('#editcourseFromList').show();
    });

    $(document).on('change', '#editCourseIsActive', function () {
        event.preventDefault();
        let isActive = $(this).is(':checked');

        updateCourseIsActive(courseInList.id , isActive);
    });

    // Handle close modal event
    $('.close').click(function () {
        $('#editcourseFromList').hide();
    });

    // Handle save button click event
    $('#saveBtnFromList').click(function () {
        event.preventDefault();

        var updatedCourse = {
            Id: courseInList.id,
            Title1: $('#editCourseTitle').val(),
            URL1: courseInList.urL1,
            Rating1: courseInList.rating1,
            NumberOfReviews1: courseInList.numberOfReviews1,
            InstructorsId1: courseInList.instructorsId1,
            ImageReference1: courseInList.imageReference1,
            Duration1: courseInList.duration1,
            LastUpdate1: courseInList.lastUpdate1 ,
            isActive1: $('#editCourseIsActive').prop('checked')
        };
        //let port = "7294";
        //let url = `https://localhost:${port}/api/Courses/update/${updatedCourse.Id}`;
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Courses/update/${updatedCourse.Id}`
        // API call to update course
        $.ajax({
            url: url,
            type: 'PUT',
            data: updatedCourse,
            success: function (response) {
                console.log('Course updated successfully');
                alert('Course updated successfully');
                getCourses();
                $('#editcourseFromList').hide();
                // You can add further logic here upon successful update
            },
            error: function (xhr, status, error) {
                alert('there is a course with the same title!');
                console.error('Error updating course:', error);
                // Handle error condition
            }
        });
    });
});

function toggleDataList() {
    let $dataList = $('#dataList');
    let $quickEditBtn = $('#quickEditBtn');
    if ($dataList.is(':visible')) {
        $dataList.hide();
        $quickEditBtn.text('Edit in dataList');
    } else {
        getCourses();
        $dataList.show();
        $quickEditBtn.text('Close list');
    }
}

function initializeDataTable(courses) {
    console.log("Courses data:", courses);
    let $coursesTable = $('#coursesTable');
    if ($.fn.DataTable.isDataTable($coursesTable)) {
        $coursesTable.DataTable().clear().destroy();
    }
    $coursesTable.DataTable({
        data: courses,
        columns: [
            { data: null, defaultContent: '<button class="edit-course-list">Edit</button>' },
            { data: 'id' },
            { data: 'title1' },
            { data: 'urL1' },
            { data: 'rating1' },
            { data: 'numberOfReviews1' },
            { data: 'lastUpdate1' },
            { data: 'instructorsId1' },
            { data: 'imageReference1' },
            { data: 'duration1' },
            {
                data: "isActive",
                render: function (data, type, row, meta) {
                    return data ? '<input type="checkbox" checked disabled="disabled" />' : '<input type="checkbox" disabled="disabled"/>';
                }
            },
        ],
        responsive: true,
        autoWidth: false,
        order: [[1, 'asc']],
        lengthChange: true,
        searching: true,
        paging: true
    });
}


function clearForm() {
    $('#courseId').val('');
    $('#courseTitle').val('');
    $('#courseID').val('');
    $('#courseInstructorId').val('');
    $('#courseURL').val('');
    $('#courseDuration').val('');
    $('#courseImageReference').val('');
    $('#courseImageUpload').val('');
    $('#courseRating').val('0');
    $('#courseReviews').val('0');
}

// Modal handling
var modal = document.getElementById("editCourseModal");
var span = document.getElementsByClassName("close")[0];
span.onclick = function () {
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
function showModal() {
    modal.style.display = "block";
}

function getCourses() {
    //let port = "7294";
    //let url = `https://localhost:${port}/api/Courses`;
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Courses`

    ajaxCall("GET", url, "", getAllSCBF, getAllECBF);
}

function getAllSCBF(courses) {
    renderCourses(courses);
    populateDatalist(courses);
    initializeDataTable(courses)
    coursesLength = courses.length + 1;
}

function getAllECBF(err) {
    console.error("Error fetching courses: ", err);
    //alert("Error fetching courses. Please try again later.");
}

$(document).on('click', '.edit-course', function () {
    mode = "edit";
    const courseId = $(this).data('id');
    $('#courseID').prop('readonly', true);
    $('#courseInstructorId').prop('readonly', true);
    console.log("Edit course button inside course clicked, course ID: ", courseId); // Debugging log
    fetchCourseDetails(courseId);
});

function renderCourses(courses) {
    let $coursesList = $('#course-list');
    $coursesList.empty();

    courses.forEach(function (course) {
        let isActiveChecked = course.isActive ? 'checked' : '';

        let courseData = `
            <div class="course">
                <h2>${course.title1}</h2>
                <h4>ID: ${course.id}</h4>
                <h4>Rating: ${course.rating1.toFixed(1)}</h4>
                <h4>Number of Reviews: ${course.numberOfReviews1}</h4>
                <h4>Last Update: ${course.lastUpdate1.split(" ")[0]}</h4>
                <h4>Duration: ${course.duration1} hours</h4>
                <h4>Instructor ID: ${course.instructorsId1}</h4>
                <h4><a href="${"https://www.udemy.com" + course.urL1}" target="_blank">Go to course</a></h4>
                <br />
                <img src="${course.imageReference1}" alt="${course.title1}">
                <br />
                <label>Active: <input type="checkbox" class="course-active" id="isActiveCheckbox_${course.id}" data-id="${course.id}" ${isActiveChecked}></label>
                <button class="edit-course" data-id="${course.id}">Edit</button>
            </div>
        `;
        $coursesList.append(courseData);
    });

    // Attach event handler after rendering courses
    attachActiveCheckboxHandler();
}

function attachActiveCheckboxHandler() {
    // Event handler for Active checkboxes
    $(document).on('change', '.course-active', function () {
        let courseId = $(this).data('id');
        let isActive = $(this).is(':checked');

        updateCourseIsActive(courseId, isActive);
    });
}

async function updateCourseIsActive(courseId, isActive) {
    //let port = "7294";
    //let url = `https://localhost:${port}/api/Courses/updateIsActive/${courseId}`;
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Courses/updateIsActive/${courseId}`;
    try {
        await $.ajax({
            type: 'PUT',
            url: url,
            data: JSON.stringify(isActive),
            contentType: 'application/json',
            success: function (result) {
                if (isActive) {
                    alert(`Course with id ${courseId} set to active`)
                } else {
                    alert(`Course with id ${courseId} updated to not active`)
                }
                console.log("Update isActive success response: ", result);
                // Optionally, update UI or notify user
            },
            error: function (err) {
                console.error("Error updating isActive status: ", err);
                alert("Error updating isActive status. Please try again later.");
            }
        });
    } catch (err) {
        console.error("Error updating isActive status: ", err);
        alert("Error updating isActive status. Please try again later.");
    }
}

function populateDatalist(courses) {
    let $datalist = $('#courses');
    $datalist.empty();

    courses.forEach(function (course) {
        let option = `<option value="${course.id}">${course.title1}</option>`;
        $datalist.append(option);
    });
}

function fetchCourseDetails(courseId) {
    //let port = "7294";
    //let url = `https://localhost:${port}/api/Courses/getCourseById/${courseId}`;
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Courses/getCourseById/${courseId}`;
    console.log("Fetching course details for course ID: ", courseId); // Debugging log

    ajaxCall("GET", url, "", function (course) {
        if (!course) {
            alert("There is no course with this ID");
        } else {
            console.log("Fetched course details: ", course); // Debugging log
            populateEditForm(course);
            showModal();
        }
    }, function (err) {
        console.error("Error fetching course details: ", err);
        //alert("Error fetching course details. Please enter a valid course ID");
    });
}

function populateEditForm(course) {
    $('#courseID').val(course.id);
    $('#courseTitle').val(course.title1);
    $('#courseURL').val(course.urL1);
    $('#courseDuration').val(course.duration1);
    $('#courseImageReference').val(course.imageReference1);
    $('#courseReviews').val(course.numberOfReviews1);
    $('#courseRating').val(course.rating1);
    $('#courseInstructorId').val(course.instructorsId1);
}

function showModal() {
    console.log("Showing modal"); // Debugging log
    var modal = document.getElementById("editCourseModal");
    modal.style.display = "block";
}

async function updateCourse() {
    let updatedCourse = {
        Id: $('#courseID').val(),
        Title1: $('#courseTitle').val(),
        URL1: $('#courseURL').val(),
        Rating1: $('#courseRating').val(),
        NumberOfReviews1: $('#courseReviews').val(),
        InstructorsId1: $('#courseInstructorId').val(),
        Duration1: parseFloat($('#courseDuration').val()),
        ImageReference1: $('#courseImageReference').val() === '' ?
            'https://cdn.prod.website-files.com/64be2485b703f9575bd09a67/64f54aac6ef461a95e69a166_OG.png' :
            $('#courseImageReference').val(),
        LastUpdate1: new Date().toISOString(),
        isActive1: true
    };

    let imageFile = $('#courseImageUpload')[0].files[0];
    let formData = new FormData();

    // Append each property of updatedCourse individually
    for (let key in updatedCourse) {
        formData.append(key, updatedCourse[key]);
    }

    // Append image file if it exists
    if (imageFile) {
        formData.append('files', imageFile);
    }

    //let port = "7294";
    //let url = `https://localhost:${port}/api/Courses/update/${$('#courseID').val()}`;
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Courses/update/${$('#courseID').val()}`;
    try {
        await $.ajax({
            type: 'PUT',
            url: url,
            data: formData,
            contentType: false,
            processData: false,
            success: function (result) {
                console.log("Update course success response: ", result);
                getCourses();
                $('#editCourseModal').hide();
                alert("The course has been updated!");
            },
            error: function (res) {
                console.error("Error updating course: ", res);
                alert("Error updating course. Please try again later.");
            }
        });
    } catch (err) {
        console.error("Error uploading image: ", err.responseJSON?.message || err.statusText);
        alert("Error uploading image: " + (err.responseJSON?.message || "Please try again later."));
    }
}


async function insertCourse() {
    let newCourse = {
        Id: $('#courseID').val(),
        Title1: $('#courseTitle').val(),
        URL1: $('#courseURL').val(),
        Rating1: 0, // Default rating value for new course
        NumberOfReviews1: 0, // Default reviews value for new course
        InstructorsId1: $('#courseInstructorId').val(),
        Duration1: parseFloat($('#courseDuration').val()),
        ImageReference1: $('#courseImageReference').val() === '' ?
            'https://cdn.prod.website-files.com/64be2485b703f9575bd09a67/64f54aac6ef461a95e69a166_OG.png' :
            $('#courseImageReference').val(),
        LastUpdate1: new Date().toISOString(),
        isActive1: true
    };
    //let port = "7294";
    let instructorId = newCourse.InstructorsId1;
    //let instructorCheckUrl = `https://localhost:${port}/api/Instructors/${instructorId}`;
    let instructorCheckUrl = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Instructors/${instructorId}`;

    ajaxCall("GET", instructorCheckUrl, null, async function (instructorExists) {
        if (instructorExists) {
            //let url = `https://localhost:${port}/api/Courses`;
            let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Courses`;

            let imageFile = $('#courseImageUpload')[0].files[0];
            let formData = new FormData();

            // Append each property of updatedCourse individually
            for (let key in newCourse) {
                formData.append(key, newCourse[key]);
            }

            // Append image file if it exists
            if (imageFile) {
                formData.append('files', imageFile);
            }

            try {
                await $.ajax({
                    type: 'POST',
                    url: url,
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (result) {
                        console.log("Insert course success response: ", result);
                        getCourses();
                        $('#editCourseModal').hide();
                        alert("The new course has been inserted successfully!");
                    },
                    error: function (err) {
                        console.error("Error inserting course: ", err);
                        alert("Error inserting course. Please try again later.");
                    }
                });
            } catch (err) {
                console.error("Error uploading image: ", err.responseJSON?.message || err.statusText);
                alert("Error uploading image: " + (err.responseJSON?.message || "Please try again later."));
            }
        } else {
            alert("Instructor ID does not exist.");
        }
    }, function (err) {
        console.error("Error checking instructor ID: ", err);
        alert("Error checking instructor ID. Please try again later.");
    });
}

$(document).on('submit', '#editCourseForm', function () {
    event.preventDefault();
    if (mode === "edit") {
        updateCourse();
    } else if (mode === "insert") {
        insertCourse();
    }
});

// Reusable AJAX call function
function ajaxCall(method, url, data, successCB, errorCB) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        contentType: method === "GET" ? "application/json; charset=utf-8" : false,
        processData: method === "GET",
        success: successCB,
        error: errorCB
    });
}

$(document).on("click", "#myCoursesBtn", function () {
    if (loggedInUser && loggedInUser.isActive1) {
        window.location.href = `MyCourses.html`;
    } else {
        alert("Sign in to see your courses!");
        openLoginModal(); // Open login modal if the user is not logged in
    }
});

function getCurrentUserId() {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.id1) {
        return loggedInUser.id1;
    } else {
        console.log("No user is currently logged in or user ID is undefined.");
        return null;
    }
}

// Log out function
$("#logoutBtn").click(function () {
    let userId = getCurrentUserId();
    if (userId) {
        // Ask for confirmation
        if (confirm("Are you sure you want to logout?")) {
            logoutUser(userId);
        } else {
            // Cancel logout
            console.log("Logout canceled.");
        }
    } else {
        alert("No user is currently logged in.");
    }
});

function logoutUser(userId) {
    //let port = "7294";
    //let url = `https://localhost:${port}/api/User/logout?userId=${userId}`;
     let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/logout?userId=${userId}`;

    $.ajax({
        type: "POST",
        url: url,
        success: function (response) {
            console.log(response);
            localStorage.removeItem('loggedInUser');
            loggedInUser = null;
            window.location.href = "index.html"; // Reload to the main page after logout
        },
        error: function (err) {
            console.log(err);
            alert("Error logging out. Please try again.");
        }
    });
}