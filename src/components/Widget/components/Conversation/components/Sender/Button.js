import React, { useState, useRef, useEffect } from 'react';

function Button({ name, size, bg, fg, text, onClick }) {

    if (size == null) {
        size = "xs"
    }

    if (bg == null) {
        bg = "lightgreen"
    }

    if (fg == null) {
        fg = "black"
    }


    let styles = {
        myBtn: {
            borderColor: "black",
            borderWidth: 1,
            borderStyle: "solid",
            width: "max-content",
            padding: 5,
            borderRadius: 5,
            margin: 5,
            backgroundColor: bg,
            fg: fg
        },
        tx: { }
    }

    return (
        <div style={styles.myBtn} className="my-btn" onClick={onClick}>
                <i className={name}></i><div style={styles.tx}>{text}</div>
{/*            <FontAwesomeIcon icon={name} size={size} /> {text} */}
        </div>
    )
}

export default Button;