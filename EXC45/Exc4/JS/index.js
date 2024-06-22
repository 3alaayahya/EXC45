$(document).ready(function () {
    // Initial check for user login status
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let registeredUser;
    updateNavbar();
    getCurrentUserId();
    //let port = "7294";
    // Call the function to fetch and render top courses when the page loads
    fetchAndRenderTopCourses();
    // Fetch courses data from the server
    fetchCoursesFromServer();
    // Function to fetch courses from the server
    function fetchCoursesFromServer() {
        $.ajax({
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Courses`,
            type: 'GET',
            success: function (coursesData) {
                coursesData.forEach(function (course) {
                    renderCourse(course);
                });
            },
            error: function (err) {
                console.log("Error fetching courses:", err);
            }
        });
    }

    // Function to fetch and render top 5 courses
    function fetchAndRenderTopCourses() {
        $.ajax({
            type: "GET",
            url: "https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Courses/GetTop5Courses",
            success: function (courses) {
                $("#top-course-list").empty(); // Clear previous content

                // Add the title for top courses
                $("#top-course-list").append('<h2>Top 5 Courses for Today!</h2>');

                // Iterate through each course and append its HTML
                courses.forEach(function (course) {
                    let courseHtml = `
                    <div class="Topcourses">
                        <h2>${course.Name}</h2>
                        <h3>Rating: ${course.Rating.toFixed(1)}</h3>
                        <h3>Number of Users: ${course.NumberOfUsers}</h3>
                    </div>
                `;
                    $("#top-course-list").append(courseHtml);
                });
            },
            error: function (err) {
                console.error("Error fetching top courses:", err);
            }
        });
    }


    // Function to render each course
    async function renderCourse(course) {
        if (course.isActive) {
            let courseData = {
                Id: course.id,
                Title1: course.title1,
                URL1: "https://www.udemy.com" + course.urL1,
                Rating1: course.rating1,
                NumberOfReviews1: course.numberOfReviews1,
                InstructorsId1: course.instructorsId1,
                ImageReference1: course.imageReference1,
                Duration1: course.duration1,
                LastUpdate1: course.lastUpdate1,
                isActive1: course.isActive
            };

            try {
                // Fetch instructor name asynchronously
                let instructorName = await getInstructorName(course.instructorsId1);

                // Build HTML with resolved instructor name
                var courseHtml = `
            <div class="course">
                <h2>${course.title1}</h2>
                <h4>Rating: ${course.rating1.toFixed(1)}</h4>
                <h4>Number of Reviews: ${course.numberOfReviews1}</h4>
                <h4>Duration: ${course.duration1}</h4>
                <h4>Instructor name: ${instructorName}</h4>
                <button class="show-more-courses" data-instructor-id="${course.instructorsId1}">Show more courses of this instructor</button><br/>
                <h4><a href="${"https://www.udemy.com" + course.urL1}" target="_blank">Go to course</a></h4><br/>
                <button class="add-course" data-course='${JSON.stringify(courseData)}'>Add Course</button><br/>
                <img src="${course.imageReference1}" alt="${course.title1}">
            </div>
        `;
                $("#course-list").append(courseHtml);
            } catch (error) {
                console.error("Error fetching instructor name:", error);
                // Fallback to displaying instructor ID or handle error as needed
                var courseHtml = `
            <div class="course">
                <h2>${course.title1}</h2>
                <h4>Rating: ${course.rating1.toFixed(1)}</h4>
                <h4>Number of Reviews: ${course.numberOfReviews1}</h4>
                <h4>Duration: ${course.duration1}</h4>
                <h4>Instructor ID: ${course.instructorsId1}</h4>
                <button class="show-more-courses" data-instructor-id="${course.instructorsId1}">Show more courses of this instructor</button><br/>
                <h4><a href="${"https://www.udemy.com" + course.urL1}" target="_blank">Go to course</a></h4><br/>
                <button class="add-course" data-course='${JSON.stringify(courseData)}'>Add Course</button><br/>
                <img src="${course.imageReference1}" alt="${course.title1}">
            </div>
        `;
                $("#course-list").append(courseHtml);
            }
        }     
    }

    // Function to get instructor name from the server
    function getInstructorName(id) {
        //let port = "7294";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Instructors/${id}`;
        // let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Instructors/${id}`;

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

    // Event delegation for dynamically added content
    $('#course-list').on('click', '.show-more-courses', function () {
        let instructorId = $(this).data('instructor-id');

        // Call function to fetch instructor courses and display modal
        openInstructorCoursesModal(instructorId);
    });

    // Function to fetch and display instructor courses in a modal
    function openInstructorCoursesModal(instructorId) {
        // Clear the form completely
        $('#instructorCoursesForm').empty();

        // Fetch instructor name asynchronously
        getInstructorName(instructorId)
            .then(instructorName => {
                // Set modal title with instructor's name
                let modalTitle = `<h1>More Courses by Instructor ${instructorName}:</h1><br>`;
                $('#instructorCoursesForm').empty().append(`<h1>More Courses by Instructor ${instructorName}:</h1><br>`);

                // AJAX request to fetch instructor courses
                $.ajax({
                    type: 'GET',
                    url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/instructors/${instructorId}/courses`,
                    success: function (courses) {
                        // Clear the form again to make sure there's no duplication
                        $('#instructorCoursesForm').find('.more-courses').remove();

                        // Populate courses in modal body
                        courses.forEach(function (course) {
                            if (course.isActive) {
                                let courseData = {
                                    Id: course.id,
                                    Title1: course.title1,
                                    URL1: "https://www.udemy.com" + course.urL1,
                                    Rating1: course.rating1,
                                    NumberOfReviews1: course.numberOfReviews1,
                                    InstructorsId1: course.instructorsId1,
                                    ImageReference1: course.imageReference1,
                                    Duration1: course.duration1,
                                    LastUpdate1: course.lastUpdate1,
                                    isActive1: course.isActive
                                };
                                let courseHtml = `
                            <div class="more-courses">
                                <h2>${course.title1}</h2>
                                <h4>Rating: ${course.rating1.toFixed(1)}</h4>
                                <h4>Number of Reviews: ${course.numberOfReviews1}</h4>
                                <h4>Duration: ${course.duration1}</h4>
                                <h4><a href="${"https://www.udemy.com" + course.urL1}" target="_blank">Go to course</a></h4>
                                <img src="${course.imageReference1}" alt="${course.title1}">
                                <button class="add-course" data-course='${JSON.stringify(courseData)}'>Add Course</button><br/>
                            </div>
                        `;
                                $('#instructorCoursesForm').append(courseHtml);
                            }
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
                $('#instructorCoursesForm').empty().append(`<h1>Courses by Instructor ID: ${instructorId}</h1><br>`);
                $('#instructorCoursesModal').css('display', 'block');
            });
    }

    // Close modal function
    $('.modal .close').click(function () {
        $(this).closest('.modal').css('display', 'none');
    });

    // Event delegation for opening modal
    $('#course-list').on('click', '.show-more-courses', function () {
        let instructorId = $(this).data('instructor-id');
        openInstructorCoursesModal(instructorId);
    });

    // Close the modal when the close button or outside modal area is clicked
    $('.close, .modal').on('click', function () {
        $('#instructorCoursesModal').css('display', 'none');
    });

    // Ensure the modal closes when the user clicks outside of it
    $(window).on('click', function (e) {
        if (e.target == $('#instructorCoursesModal')[0]) {
            $('#instructorCoursesModal').css('display', 'none');
        }
    });

    // Event listener for Add Course button in the instructor courses modal
    $(document).on("click", ".add-course", function () {
        let courseData = JSON.parse($(this).attr("data-course"));

        if (loggedInUser && loggedInUser.isActive1) {
            AddCourseToUser(getCurrentUserId(), courseData.Id);
        } else {
            alert("You are not signed in! Sign in or register now");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });


    $(document).on("click", "#adminPage", function () {
        if (loggedInUser && loggedInUser.isActive1 && loggedInUser.isAdmin1) {
            window.location.href = `Admin.html`;
        } else {
            alert("Sign in as an admin to visit this page!");
            openLoginModal(); // Open login modal if the user is not logged in as an admin
        }
    });

    $(document).on("click", "#myCoursesBtn", function () {
        if (loggedInUser && loggedInUser.isActive1) {
            window.location.href = `MyCourses.html`;
        } else {
            alert("Sign in to see your courses!");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });

    function AddCourseToUser(userId, courseId) {
        //let port = "7294";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/addCourseToUser/userId/${userId}/courseId/${courseId}`;
        // let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/addCourseToUser/userId/${userId}/courseId/${courseId}`;
        ajaxCall("POST", url, null, postSCBF, postECBF);
    }

    function postSCBF(result) {
        console.log(result);
        if (result) {
            alert("The course has been added!");
            fetchAndRenderTopCourses();
        } else {
            alert("Error: This course has already been added!");
        }
    }

    function postECBF(err) {
        console.log(err);
    }

    // Function to open the login modal
    function openLoginModal() {
        $("#registerFormContainer").hide();
        $("#loginFormContainer").show();
        $("#loginModal").css("display", "block");
    }

    // Function to open the registration modal
    function openRegisterModal() {
        $("#loginFormContainer").hide();
        $("#registerFormContainer").show();
        $("#loginModal").css("display", "block");
    }

    // Get the modal
    var modal = document.getElementById("loginModal");

    // Get the button that opens the modal
    var loginBtn = document.getElementById("loginBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the login button, open the login modal
    loginBtn.onclick = openLoginModal;

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Toggle between login and registration forms
    $("#showRegisterForm").click(openRegisterModal);
    $("#showLoginForm").click(openLoginModal);

    // Validate forms
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        var email = $("#loginEmail").val();
        var password = $("#loginPassword").val();
        var user = {
            Email1: email,
            Password1: password
        }
        if (email && password.length >= 4) {
            loginToServer(user);
        } else {
            alert("All fields are mandatory and password must be at least 4 characters.");
        }
    });

    $("#registerForm").submit(function (event) {
        event.preventDefault(); // Prevent form submission from reloading the page

        // Clear existing error messages
        $(".error-message").remove();

        var name = $("#registerName").val();
        var id = $("#registerId").val();
        var email = $("#registerEmail").val();
        var password = $("#registerPassword").val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        var user = {
            Name1: name,
            Id1: id,
            Email1: email,
            Password1: password
        };

        var isValid = true;

        if (!name) {
            $("#registerName").before('<div class="error-message">Name is required and must be at least 7 letters.</div>');
            isValid = false;
        }
        if (!email.match(emailPattern)) {
            $("#registerEmail").before('<div class="error-message">Email must be valid, Format: X@X.XX.</div>');
            isValid = false;
        }
        if (password.length < 4) {
            $("#registerPassword").before('<div class="error-message">Password must be at least 4 characters.</div>');
            isValid = false;
        }
        if (id.length != 9 || !/^\d+$/.test(id)) {
            $("#registerId").before('<div class="error-message">Id must be 9 numbers.</div>');
            isValid = false;
        }

        if (isValid) {
            registerToServer(user);
        }
    });

    function registerToServer(user) {
        //let port = "7294";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/register`;
//      let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/register`
        registeredUser = user;

        ajaxCall("POST", url, JSON.stringify(user), registerSCBF, registerECBF);
    }

    function registerSCBF(result) {
        console.log(result);
        if (result) {
            alert("The user has been registered successfully");
            loginToServer(registeredUser);
        }
    }

    function registerECBF(err) {
        console.log(err);
        alert("This email is already in use!");
    }

    function loginToServer(user) {
        //let port = "7294";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/login?email=${user.Email1}&password=${user.Password1}`;
//        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/login?email=${user.Email1}&password=${user.Password1}`;
        ajaxCall("POST", url, JSON.stringify(user), function (result) {
            if (result && result.user) {
                localStorage.setItem('loggedInUser', JSON.stringify(result.user));
                loggedInUser = result.user;
                updateNavbar();
                location.reload(); // Reload the page after login
            }
        }, function (err) {
            console.log(err);
            alert("The password or email is incorrect!");
        });
    }
    getCurrentUserId();
    function getCurrentUserId() {
        let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.id1) {
            return loggedInUser.id1;
        } else {
            console.log("No user is currently logged in or user ID is undefined.");
            return null;
        }
    }

    // Update navbar based on login status
    function updateNavbar() {
        if (loggedInUser && loggedInUser.isActive1) {
            $("#loginBtn").hide();
            $("#hiUser").show();
            $("#hiUser").text(`Hi ${loggedInUser.name1}`);
            $("#myCoursesBtn").show();
            $("#logoutBtn").show();
            if (loggedInUser.isAdmin1) {
                $("#adminPage").show();
            }
        } else {
            $("#loginBtn").show();
            $("#hiUser").hide();
            $("#logoutBtn").hide();
            $("#adminPage").hide();
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

    // Generic AJAX call function
    function ajaxCall(method, url, data, successCB, errorCB) {
        $.ajax({
            type: method,
            url: url,
            data: data,
            contentType: 'application/json',
            success: successCB,
            error: errorCB
        });
    }
});