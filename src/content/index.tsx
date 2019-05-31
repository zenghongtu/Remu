import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.less";

const root = document.createElement("div");
root.id = "my-rem-content";
document.body.appendChild(root);

ReactDOM.render(<div>12</div>, root);
