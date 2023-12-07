/**
Final Project
Ahmed Alzehhawi
12/07/2023
*/


const createElemWithText = (htmlElem = "p", textContent = "", className) => {
    const newElement = document.createElement(htmlElem);
    newElement.textContent = textContent;
    if (className) newElement.className = className;
    return newElement;
};

const createSelectOptions = (users) => {
    if (!users) return undefined;
    const optionElements = [];
    users.forEach((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        optionElements.push(option);
    });
    return optionElements;
};

const toggleCommentSection = (postId) => {
    if (!postId) return undefined;
    const section = document.querySelector(`section[data-post-id='${postId}']`);
    if (!section) return null;
    section.classList.toggle("hide");
    return section;
};

const toggleCommentButton = (postId) => {
    if (!postId) return undefined;
    const button = document.querySelector(`button[data-post-id='${postId}']`);
    if (!button) return null;
    button.textContent = button.textContent === "Show Comments" ? "Hide Comments" : "Show Comments";
    return button;
};

const deleteChildElements = (parentElement) => {
    const isDOM = (el) => el instanceof Element;
    if (!parentElement || !isDOM(parentElement)) return undefined;
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
};

const addButtonListeners = () => {
    const buttons = document.querySelectorAll("main button");
    if (!buttons) return;
    buttons.forEach((button) => {
        const postId = button.dataset.postId;
        button.addEventListener("click", (event) => {
            toggleComments(event, postId);
        });
    });
    return buttons;
};

const removeButtonListeners = () => {
    const buttons = document.querySelectorAll("main button");
    if (!buttons) return;
    buttons.forEach((button) => {
        const postId = button.dataset.id;
        button.removeEventListener("click", (event) => {
            toggleComments(event, postId);
        });
    });
    return buttons;
};

const createComments = (commentData) => {
    if (!commentData) return undefined;
    const frag = document.createDocumentFragment();
    commentData.forEach((comment) => {
        const article = document.createElement("article");
        const h3 = createElemWithText("h3", comment.name);
        const body = createElemWithText("p", comment.body);
        const from = createElemWithText("p", `From: ${comment.email}`);
        article.append(h3, body, from);
        frag.append(article);
    });
    return frag;
};

const populateSelectMenu = (userData) => {
    if (!userData) return undefined;
    const selectElement = document.querySelector("#selectMenu");
    const options = createSelectOptions(userData);
    options.forEach((option) => {
        selectElement.append(option);
    });
    return selectElement;
};

const getUsers = async () => {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) throw new Error("Status code not in 200-299 range");
        return await res.json();
    } catch (error) {
        console.log(error);
    }
};

const getUserPosts = async (userId) => {
    if (!userId) return undefined;
    try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if (!res.ok) throw new Error("Status code not in 200-299 range");
        return await res.json();
    } catch (error) {
        console.log(error);
    }
};

const getUser = async (userId) => {
    if (!userId) return undefined;
    try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/users?id=${userId}`);
        if (!res.ok) throw new Error("Status code not in 200-299 range");
        let found = await res.json();
        if (found.length === 0) throw new Error("User not found");
        return found[0];
    } catch (error) {
        console.log(error);
    }
};

const getPostComments = async (postId) => {
    if (!postId) return undefined;
    try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        if (!res.ok) throw new Error("Status code not in 200-299 range");
        return await res.json();
    } catch (error) {
        console.log(error);
    }
};

const displayComments = async (postId) => {
    if (!postId) return undefined;
    const section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add("comments", "hide");
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.appendChild(fragment);
    return section;
};

const createPosts = async (postsJSON) => {
    if (!postsJSON) return undefined;
    const fragment = document.createDocumentFragment();
    for (let post of postsJSON) {
        const article = document.createElement("article");
        const h2 = createElemWithText("h2", post.title);
        const p_body = createElemWithText("p", post.body);
        const p_postId = createElemWithText("p", `Post ID: ${post.id}`);
        const author = await getUser(post.userId);
        const p_author = createElemWithText("p", `Author: ${author.name} with ${author.company.name}`);
        const p_catchphrase = createElemWithText("p", `${author.company.catchPhrase}`);
        const button = createElemWithText("button", "Show Comments");
        button.dataset.postId = post.id;
        const section = await displayComments(post.id);
        article.append(h2, p_body, p_postId, p_author, p_catchphrase, button, section);
        fragment.appendChild(article);
    }
    return fragment;
};

const displayPosts = async (postsJSON) => {
    const main = document.querySelector("main");
    let element;
    if (postsJSON) {
        element = await createPosts(postsJSON);
    } else {
        element = createElemWithText("p", "Select an Employee to display their posts.");
        element.classList.add("default-text");
    }
    main.append(element);
    return element;
};

const toggleComments = (event, postId) => {
    if (!event || !postId) return undefined;
    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
};

const refreshPosts = async (postsJSON) => {
    if (!postsJSON) return undefined;
    const removeButtons = removeButtonListeners();
    let main = document.querySelector("main");
    main = deleteChildElements(main);
    const fragment = await displayPosts(postsJSON);
    const addButtons = addButtonListeners();
    return [removeButtons, main, fragment, addButtons];
};

const selectMenuChangeEventHandler = async (event) => {
    if (!event) return undefined;

    const selectMenu = event.target;
    selectMenu.disabled = true;

    const userId = event.target.value || 1;

    try {
        const postsJSON = await getUserPosts(userId);
        const refreshPostsArray = await refreshPosts(postsJSON);
        selectMenu.disabled = false;
        return [userId, postsJSON, refreshPostsArray];
    } catch (error) {
        console.error(error);
        selectMenu.disabled = false;
        return undefined;
    }
};


const initPage = async () => {
    const usersJSON = await getUsers();
    const select = populateSelectMenu(usersJSON);
    return [usersJSON, select];
};

const initApp = () => {
    initPage();
    const select = document.getElementById("selectMenu");
    select.addEventListener(
        "change",
        (event) => selectMenuChangeEventHandler(event),
        false
    );
};

document.addEventListener("DOMContentLoaded", initApp());

