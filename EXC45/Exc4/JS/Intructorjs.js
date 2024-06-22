$(document).ready(function () {
    //let port = "7294";
    let currentUser = JSON.parse(localStorage.getItem('loggedInUser'));

    updateNavbar();
    // Function to update the navbar based on login status
    function updateNavbar() {
        if (currentUser && currentUser.isActive1) {
            $('#loginBtn').hide();
            $('#logoutBtn').show();
            $('#myCoursesBtn').show();
            if (currentUser.isAdmin1) {
                $('#adminPage').show();
            } else {
                $('#adminPage').hide();
            }
            $('#hiUser').text(`Hi, ${currentUser.name1}`);
        } else {
            $('#loginBtn').show();
            $('#logoutBtn').hide();
            $('#myCoursesBtn').show();
            $('#adminPage').hide();
            $('#hiUser').text('');
        }
    }

    fetchAndRenderInstructors();

    function fetchAndRenderInstructors() {
        $.ajax({
            type: "GET",
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Instructors`,
            success: function (instructors) {
                renderInstructors(instructors);
            },
            error: function (err) {
                console.error("Error fetching instructors:", err);
                alert("Error fetching instructors. Please try again later.");
            }
        });
    }

    function renderInstructors(instructors) {
        let $instructorsList = $('#instructors-list');
        $instructorsList.empty();

        instructors.forEach(function (instructor) {
            let instructorData = `
                <div class="Instructor">
                    <h2>${instructor.title}</h2>
                    <h4>Name: ${instructor.name}</h4>
                    <h4>Job title: ${instructor.jobTitle}</h4>
                    <img src="${instructor.image}" alt="${instructor.name}">
                    <button class="show-courses-btn" data-instructor-id="${instructor.id}">Show Courses by ${instructor.name}</button>
                </div>
            `;
            $instructorsList.append(instructorData);
        });
    }

    // Event delegation for dynamically added "Show Courses" button
    $('#instructors-list').on('click', '.show-courses-btn', function () {
        let instructorId = $(this).data('instructor-id');
        openInstructorCoursesModal(instructorId);
    });

    // Function to fetch and display instructor courses in a modal
    function openInstructorCoursesModal(instructorId) {
        $('#instructorCoursesForm').empty();

        // Fetch instructor name asynchronously
        getInstructorName(instructorId)
            .then(instructorName => {
                // Set modal title with instructor's name
                let modalTitle = `<h1>Courses by Instructor ${instructorName}:</h1><br>`;
                $('#instructorCoursesForm').append(modalTitle);

                // AJAX request to fetch instructor courses
                $.ajax({
                    type: 'GET',
                    url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/instructors/${instructorId}/courses`,
                    success: function (courses) {
                        // Populate courses in modal body
                        courses.forEach(function (course) {
                            let courseHtml = `
                                <div class="course">
                                    <h2>${course.title1}</h2>
                                    <h4>Rating: ${course.rating1.toFixed(1)}</h4>
                                    <h4>Number of Reviews: ${course.numberOfReviews1}</h4>
                                    <h4>Duration: ${course.duration1}</h4>
                                    <h4><a href="${"https://www.udemy.com" + course.urL1}" target="_blank">Go to course</a></h4>
                                    <img src="${course.imageReference1}" alt="${course.title1}">
                                </div>
                            `;
                            $('#instructorCoursesForm').append(courseHtml);
                        });

                        // Show the modal
                        $('#instructorCoursesModal').css('display', 'block');
                    },
                    error: function (err) {
                        console.error('Error fetching instructor courses:', err);
                        // Handle error
                    }
                });

            })
            .catch(err => {
                console.error('Error fetching instructor name:', err);
                // If there's an error fetching the instructor name, fall back to displaying ID
                $('#instructorCoursesModal .modal-content h2').text(`Courses by Instructor ID: ${instructorId}`);
                $('#instructorCoursesModal').css('display', 'block');
            });
    }

    // Function to get instructor name from the server
    function getInstructorName(id) {
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Instructors/${id}`;

        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: url,
                success: function (instructor) {
                    if (instructor && instructor.name) {
                        resolve(instructor.name);
                    } else {
                        reject("Instructor not found or name not available.");
                    }
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
    }

    // My Courses button click handler
    $('#myCoursesBtn').click(function () {
        if (currentUser && currentUser.isActive1) {
            // Redirect to My Courses page
            window.location.href = 'mycourses.html';
        } else {
            alert('Please log in to access your Courses.');
        }
    });

    $("#logoutBtn").click(function () {
        let userId = currentUser.id1;
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
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/logout?userId=${userId}`;
        // let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/logout?userId=${userId}`;

        $.ajax({
            type: "POST",
            url: url,
            success: function (response) {
                console.log(response);
                localStorage.removeItem('loggedInUser');
                loggedInUser = null;
                updateNavbar();
                location.reload();
            },
            error: function (err) {
                console.log(err);
                alert("Error logging out. Please try again.");
            }
        });
    }

    // Login button click handler
    $('#loginBtn').click(function () {
        alert('Please log in on the main page.');
        // Redirect to main page (index.html)
        window.location.href = 'index.html';
    });

    // Admin page click handler
    $('#adminPage').click(function () {
        // Redirect to admin page
        window.location.href = 'admin.html';
    });

    // Close modal function
    $('.modal .close').click(function () {
        $(this).closest('.modal').css('display', 'none');
    });

    // Close the modal when the close button or outside modal area is clicked
    $(window).on('click', function (e) {
        if (e.target == $('#instructorCoursesModal')[0]) {
            $('#instructorCoursesModal').css('display', 'none');
        }
    });
});
