// Session storage helper functions
// Manages user login data in browser
// Store and retrieve user information so you stay logged in

// const : the function name stays like that forever , let: nguoc lai
// export: share the function with other files, vd: import { storeInSession } from "./common/session";
// storeInSession("user", userData);  // Now you can use it!

// syntax: = (input_parameters) => {code duoc thuc thi neu goi ham nay}

// browser: sessionStorage (in brower, js can save small data temporarily), localStorage, cookies
// sessionStorage: data bi xoa khi tab hoac browser bi dong

// Mongodb: user, blog, comments, notification collections

export const storeInSession = (key, value) => {
    return sessionStorage.setItem(key, value);
}

export const lookInSession = (key) => {
    return sessionStorage.getItem(key);
}

export const removeFromSession = (key) => {
    return sessionStorage.removeItem(key);
}

export const logOutUser = () => {
    sessionStorage.clear();
}
