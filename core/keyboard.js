const cbs = {}

document.addEventListener(
    "keydown",
    (event) => {
        const keyName = event.key;

        //console.log(cbs);
        if (cbs[keyName]) {
            cbs[keyName]();
        }

        // if (event.ctrlKey) {
        //     // Even though event.key is not 'Control' (e.g., 'a' is pressed),
        //     // event.ctrlKey may be true if Ctrl key is pressed at the same time.
        //     alert(`Combination of ctrlKey + ${keyName}`);
        // } else {
        //     alert(`Key pressed ${keyName}`);
        // }
    },
    false,
);

document.addEventListener(
    "keyup",
    (event) => {
        const keyName = event.key;

        // As the user releases the Ctrl key, the key is no longer active,
        // so event.ctrlKey is false.
        if (keyName === "Control") {
            //alert("Control key was released");
        }
    },
    false,
);

export const Keyboard = {
    on: function (key, cb) {
        cbs[key] = cb;
    }
}


