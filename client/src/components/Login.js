import React, { useState } from "react";
import Footer from "./Footer";
import NavBar from "./header";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import GoogleButton from 'react-google-button'
import "../assests/styling/Login.css"
import { useNavigate } from "react-router-dom";
import NotiComp from "./notification_component";
import { CreateAccountPopup } from "./signup";
import { Loader } from "./loader";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { ValidateUser } from "../apis/userAndAccountDetails";
function Login({ notOn, setnotOn, loader, setloader }) {
    const LoginState = useAuthContext();
    let navigate = useNavigate();
    function navigateToDashoard() {
        navigate("/Dashboard");
    }
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    function changeUsername(e) {
        setusername(e.target.value);
    }
    function changepass(e) {
        setpassword(e.target.value);
    }
    async function setCredentials(e) {
        setloader("display");
        e.preventDefault()
        await ValidateUser({username,password}).then(() => {
            console.log("succcessfully logged in");
            LoginState.dispatch({
                type: "LOGIN",
                payload: username
            })
            setloader("none")
        }).then(navigateToDashoard)
            .catch((err) => {
                setloader("none")
                alert(err)
            })

        setloader("none")

    }
    const style = {
        display: "none",
        opacity: "100%",
    }
    const [isclick, setIsclick] = useState(0);
    const [popUpStyle, setpopUpStyle] = useState(style)
    function handleclick(e) {
        if (isclick === 0) {
            setIsclick(1);
            setpopUpStyle({ display: "block", opacity: "10%" });
        }

    }
    function getBackStyle(e) {
        setIsclick(0);
        setpopUpStyle({ display: "none", opacity: "100%" })
    }

    return (
        <>
            <NavBar setnotOn={setnotOn} />
            {loader === "display" &&
                <Loader loader={loader} />
            }
            <div className="main-box" style={{ display: popUpStyle.display }}>
                <CreateAccountPopup
                    getBackStyle={getBackStyle}
                />
            </div>
            <div style={{ opacity: popUpStyle.opacity }}>
                <NotiComp
                    notOn={notOn}
                />
                <div onClick={() => setnotOn({ display: "none" })}>
                    <div style={{ height: "80px" }} ></div>
                    <Form onSubmit={(e) => setCredentials(e)}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label className="email-label">Email Username</Form.Label>
                            <Form.Control type="text" placeholder="Enter your username" className="login-email" onChange={(e) => changeUsername(e)} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label className="password-label">Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" className="password-field" value={password} onChange={(e) => changepass(e)} suggested="current-paasword" autoComplete="on" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicCheckbox" style={{ width: "100%", marginLeft: "35.5%" }}>
                            <Form.Check type="checkbox" label="Remember Me" />
                        </Form.Group>
                        <Button variant="primary" type="submit" style={{ width: "30%", marginLeft: "35%", fontSize: "20px", backgroundColor: "#2c8894", marginTop: "20px" }}>
                            Submit
                        </Button>
                        <div className="Forget-password" style={{ textAlign: "right", marginRight: "35%", padding: "10px" }}><a href="/">Forget Password? </a> </div>

                        <div style={{ display: "flex", marginTop: "20px" }}>
                            <div style={{ width: "13%", height: "2px", marginLeft: "35%", backgroundColor: "black" }}></div>
                            <div style={{ width: "2%", border: "1px solid black", borderRadius: "10px", zIndex: "10", margin: "-10px 1% 10px 1%", textAlign: "center" }}><strong>OR</strong></div>
                            <div style={{ width: "13%", height: "2px", backgroundColor: "black" }}>
                            </div>
                        </div>
                        <div style={{ width: "100%", marginLeft: "35%", marginTop: "30px", marginBottom: "20px" }}>
                            <GoogleButton style={{ width: "30%" }} />
                        </div>
                        <div className="create-account-pop" onClick={(e) => handleclick(e)}>
                            <h6>
                                Need an Account?
                            </h6>
                            <div style={{ width: "5px" }}></div>
                            <p>Create One.</p>

                        </div>
                    </Form>

                </div>
                <Footer />
            </div>

        </>
    )

}
export default Login;