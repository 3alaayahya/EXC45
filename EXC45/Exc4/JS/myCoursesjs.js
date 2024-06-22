$(document).ready(function () {
    //let port = "7294";
    userID = getCurrentUserId();
    let api = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/getCourses/${userID}`;
    //let api = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/getCourses/${loggedInUser.id}`;

    ajaxCall("GET", api, "", successCallBackFunction, errorCallBackFunction);

    function successCallBackFunction(courses) {
        console.log(courses);
        $("#my-courses-list").empty();

        courses.forEach(function (course) {
            renderCourse(course);
        });
    }

    function errorCallBackFunction(err) {
        console.error("Error fetching courses: ", err);
        $("#my-courses-list").html("<p>Error fetching courses. Please try again later.</p>");
    }

    function getCurrentUserId() {
        let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.id1) {
            return loggedInUser.id1;
        } else {
            console.log("No user is currently logged in or user ID is undefined.");
            return null;
        }
    }

    $(document).on("click", "#adminPage", function () {
        if (loggedInUser && loggedInUser.isActive1 && loggedInUser.isAdmin1) {
            window.location.href = `Admin.html`;
        } else {
            alert("sign in as an admin to visit this page!");
            openLoginModal(); // Open login modal if the user is not logged in as an admin
        }
    });

    // Log out function
    $("#logOutBtn").click(function () {
        localStorage.removeItem('loggedInUser');
        loggedInUser = null;
        updateNavbar();
        window.location.href = "index.html"; // Reload to the main page after logout
    });

    function errorCallBackFunction(err) {
        console.error("Error fetching courses: ", err);
        $("#my-courses-list").html("<p>Error fetching courses. Please try again later.</p>");
    }

    $('#fetch-by-duration').on('click', function () {
        let minDuration = parseFloat($('#min-duration').val());
        let maxDuration = parseFloat($('#max-duration').val());

        if (!isNaN(minDuration) && !isNaN(maxDuration) && maxDuration >= minDuration) {
            fetchCoursesByDurationRange(userID,minDuration, maxDuration);
        } else {
            alert('Please enter valid values for both minimum and maximum duration.');
        }
    });

    $('#fetch-by-rating').on('click', function () {
        let minRating = parseFloat($('#min-rating').val());
        let maxRating = parseFloat($('#max-rating').val());

        if (!isNaN(minRating) && !isNaN(maxRating) && maxRating >= minRating && minRating >= 1 && maxRating <= 5) {
            fetchCoursesByRatingRange(userID, minRating, maxRating);
        } else {
            alert('Please select valid values for both minimum and maximum rating (1 to 5).');
        }
    });

    $('#delete-by-id').on('click', function () {
        let courseId = parseInt($('#delete-id').val());
        if (!isNaN(courseId)) {
            deleteCourseById(userID,courseId);
        } else {
            alert('Please enter a valid course ID.');
        }
    });

    $(document).on('click', '.delete-course', function () {
        let courseId = $(this).data('id');
        if (confirm('Are you sure you want to delete this course?')) {
            deleteCourseById(userID,courseId);
        }
    });

    function fetchCoursesByDurationRange(userId,min, max) {
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/searchByDuration/userId/${userId}/durationFrom/${min}/DurationTo/${max}`;
        //let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/searchByDurationFrom=${min}&DurationTo=${max}`;
        ajaxCall("GET", url, "", successCallBackFunction, errorCallBackFunction);
    }

    function fetchCoursesByRatingRange(userId, min, max) {
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/searchByRating/userId/${userId}/ratingFrom/${min}/ratingTo/${max}`;
        //let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/searchByRouting/ratingFrom/${min}/ratingTo/${max}`;

        ajaxCall("GET", url, "", successCallBackFunction, errorCallBackFunction);
    }

    function deleteCourseById(userId,courseId) {
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/DeleteCourseByIdForUser/userId/${userId}/courseId/${courseId}`;
        //let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/DeleteById/id/${id}`;

        ajaxCall("DELETE", url, "", deleteSuccessCallBackFunction, deleteErrorCallBackFunction);
    }

    function deleteSuccessCallBackFunction(response) {
        console.log(response); // Display the response message from the server
        alert("The course has been deleted seccessfuly");
        ajaxCall("GET", api, "", successCallBackFunction, errorCallBackFunction);
    }

    function deleteErrorCallBackFunction(err) {
        console.log(err);
        alert("The course with this id has been not found!");
    }

    $(document).on('click', '#reset', function () {
        ajaxCall("GET", api, "", successCallBackFunction, errorCallBackFunction);
    });

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
                <h4>ID: ${course.id}</h4>
                <h4>Rating: ${course.rating1.toFixed(1)}</h4>
                <h4>Number of Reviews: ${course.numberOfReviews1}</h4>
                <h4>Duration: ${course.duration1}</h4>
                <h4>Instructor name: ${instructorName}</h4>
                <h4><a href="${"https://www.udemy.com" + course.urL1}" target="_blank">Go to course</a></h4><br/>
                <img src="${course.imageReference1}" alt="${course.title1}">
                <button class="delete-course" data-id="${course.id}">Delete</button>
            </div>
        `;
                $("#my-courses-list").append(courseHtml);
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
                <h4><a href="${"https://www.udemy.com" + course.urL1}" target="_blank">Go to course</a></h4><br/>
                <img src="${course.imageReference1}" alt="${course.title1}">
                <button class="delete-course" data-id="${course.id}">Delete</button>
            </div>
        `;
                $("#my-courses-list").append(courseHtml);
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

});

let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

$(document).on("click", "#adminPage", function () {
    if (loggedInUser && loggedInUser.isActive1 && loggedInUser.isAdmin1) {
        window.location.href = `Admin.html`;
    } else {
        alert("sign in as an admin to visit this page!");
        openLoginModal(); // Open login modal if the user is not logged in as an admin
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