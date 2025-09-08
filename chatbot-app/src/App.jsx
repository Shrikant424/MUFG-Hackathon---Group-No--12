import './App.css';
import React, { useState } from "react";
import UserDataForm from "./UserDataForm";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";


import getConfig from "./chatbot/Config";
import MessageParser from "./chatbot/MessageParser";
import ActionProvider from "./chatbot/ActionProvider";

function App() {
  const [formData, setFormData] = useState(null);
  
  return (
    <div className="App">
      {!formData ? (
        <UserDataForm setFormData={setFormData} />
      ) : (
        <div className="chatbot-wrapper">
          <Chatbot
            config={getConfig(formData)}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </div>
      )}
    </div>
  );
}

export default App;
// import './App.css';
// import React, { useState } from "react";
// import UserDataForm from "./UserDataForm";
// import Chatbot from "react-chatbot-kit";
// import "react-chatbot-kit/build/main.css";

// import config from "./chatbot/Config";
// import MessageParser from "./chatbot/MessageParser";
// import ActionProvider from "./chatbot/ActionProvider";

// function App() {
//   const [formData, setFormData] = useState(null);

//   return (
//     <div className="App">
//       {!formData ? (
//         <UserDataForm setFormData={setFormData} />
//       ) : (
//         <div className="chatbot-wrapper">
//           <Chatbot
//             config={config(formData)}      // pass form data in config
//             messageParser={MessageParser}   // just pass the class
//             actionProvider={ActionProvider} // just pass the class
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
