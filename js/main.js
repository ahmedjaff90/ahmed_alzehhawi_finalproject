

// 1. createElemWithText
function createElemWithText(elementName = "p", textContent = "", className) {
    const element = document.createElement(elementName);
    element.textContent = textContent;
    if (className) {
        element.className = className;
    }
    return element;
}

// 2. createSelectOptions
function createSelectOptions(usersData) {
    if (!usersData) {
        return undefined;
    }

    const options = [];
    for (const user of usersData) {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        options.push(option);
    }

    return options;
}

// 3. toggleCommentSection
function toggleCommentSection(postId) {
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (section) {
        section.classList.toggle("hide");
    }
    return section;
}

// 4. toggleCommentButton
function toggleCommentButton(postId) {
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (button) {
        button.textContent = button.textContent === 'Show Comments' ? 'Hide Comments' : 'Show Comments';
    }
    return button;
}

// 5. deleteChildElements
function deleteChildElements(parentElement) {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}

// 6. addButtonListeners
function addButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    if (buttons.length > 0) {
        for (const button of buttons) {
            const postId = button.dataset.postId;
            if (postId) {
                button.addEventListener('click', function (event) {
                    toggleComments(event, postId);
                });
            }
        }
    }
    return buttons;
}

// 7. removeButtonListeners
function removeButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    for (const button of buttons) {
        const postId = button.dataset.postId;
        if (postId) {
            button.removeEventListener('click', function (event) {
                toggleComments(event, postId);
            });
        }
    }
    return buttons;
}

// 8. createComments
function createComments(commentsData) {
    const fragment = document.createDocumentFragment();
    for (const comment of commentsData) {
        const article = document.createElement('article');
        const h3 = createElemWithText('h3', comment.name);
        const bodyParagraph = createElemWithText('p', comment.body);
        const emailParagraph = createElemWithText('p', `From: ${comment.email}`);

        article.appendChild(h3);
        article.appendChild(bodyParagraph);
        article.appendChild(emailParagraph);

        fragment.appendChild(article);
    }
    return fragment;
}

// 9. populateSelectMenu
async function populateSelectMenu(usersData) {
    const selectMenu = document.getElementById('selectMenu');
    const options = createSelectOptions(usersData);

    for (const option of options) {
        selectMenu.appendChild(option);
    }

    return selectMenu;
}

// 10. getUsers
async function getUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// 11. getUserPosts
async function getUserPosts(userId) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}/posts`);
        const userPostsData = await response.json();
        return userPostsData;
    } catch (error) {
        console.error(`Error fetching posts for user ${userId}:`, error);
        throw error;
    }
}

// 12. getUser
async function getUser(userId) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
}

// 13. getPostComments
async function getPostComments(postId) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
        const commentsData = await response.json();
        return commentsData;
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        throw error;
    }
}

// 14. displayComments
async function displayComments(postId) {
    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');

    const comments = await getPostComments(postId);
    const fragment = createComments(comments);

    section.appendChild(fragment);
    return section;
}

// 15. createPosts
async function createPosts(postsData) {
    const fragment = document.createDocumentFragment();

    for (const post of postsData) {
        const article = document.createElement('article');
        const h2 = createElemWithText('h2', post.title);
        const bodyParagraph = createElemWithText('p', post.body);
        const idParagraph = createElemWithText('p', `Post ID: ${post.id}`);

        const author = await getUser(post.userId);
        const authorParagraph = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const catchPhraseParagraph = createElemWithText('p', author.company.catchPhrase);

        const button = createElemWithText('button', 'Show Comments');
        button.dataset.postId = post.id;

        const section = await displayComments(post.id);

        article.appendChild(h2);
        article.appendChild(bodyParagraph);
        article.appendChild(idParagraph);
        article.appendChild(authorParagraph);
        article.appendChild(catchPhraseParagraph);
        article.appendChild(button);
        article.appendChild(section);

        fragment.appendChild(article);
    }

    return fragment;
}

// 16. displayPosts
async function displayPosts(posts) {
    const mainElement = document.querySelector('main');
    const element = posts
        ? await createPosts(posts)
        : createElemWithText('p', 'Select an Employee to display their posts.');

    mainElement.appendChild(element);
    return element;
}

// 17. toggleComments
function toggleComments(event, postId) {
    event.target.listener = true; // For testing accuracy
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
}

// 18. refreshPosts
async function refreshPosts(postsData) {
    const removeButtons = removeButtonListeners();
    const mainElement = deleteChildElements(document.querySelector('main'));
    const fragment = await displayPosts(postsData);
    const addButtons = addButtonListeners();

    return [removeButtons, mainElement, fragment, addButtons];
}

// 19. selectMenuChangeEventHandler
async function selectMenuChangeEventHandler(event) {
    const selectMenu = document.getElementById('selectMenu');
    selectMenu.disabled = true;

    const userId = event.target.value || 1;
    const posts = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(posts);

    selectMenu.disabled = false;
    return [userId, posts, refreshPostsArray];
}

// 20. initPage
async function initPage() {
    const users = await getUsers();
    const select = await populateSelectMenu(users);

    return [users, select];
}

// 21. initApp
function initApp() {
    const [users, select] = initPage();
    const selectMenu = document.getElementById('selectMenu');

    selectMenu.addEventListener('change', selectMenuChangeEventHandler);
}

// Call initApp after the DOM content has loaded
document.addEventListener('DOMContentLoaded', initApp);

