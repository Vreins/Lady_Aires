import React, { 
  // useEffect, 
  useState } from 'react';
import Axios from 'axios'
import { Link, 
  // useNavigate, 
  useLocation } from 'react-router-dom';
import MessageBox from '../components/MessageBox';

export default function RegisterScreen() {
  const [data, setData] = useState({
	name: "",
	email: "",
	password: "",
	// confirmPassword: "",
	});
  const { search }= useLocation()
  const redirectInUrl= new URLSearchParams(search).get('redirect')
  const redirect= redirectInUrl ? redirectInUrl: '/'
const [error, setError] = useState("");
const [msg, setMsg] = useState("");

const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
	};

const [confirmPassword, setConfirmPasword]= useState("")
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);
  const hasNumber = /\d/.test(data.password);
  const hasAlphabet = /[a-zA-Z]/.test(data.password);

  const submitHandler = async (e) => {
		e.preventDefault();
		try {
			const url = "/api/users/register";
			const { data: res } = await Axios.post(url, data);
			setMsg(res.message);
		} catch (error) {
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status <= 500
			) {
				setError(error.response.data.message);
			}
		}
    if (data.password !== confirmPassword) {
      alert('Password and confirm password are not match');    
    } 
    else if (data.name.includes(" ")) {alert("Name field must not contain space");}
    else if (data.password.includes(" ")) {alert("Password field must not contain space");}
    else if (data.password.length<8) {alert("Password must be more than 8 characters")}
    else if (!hasSpecialCharacter) {alert("Password must contain at least one special character")}
    else if (!hasNumber) {alert("Password must contain at least one number")}
    else if (!hasAlphabet) {alert("Password must contain at least one letter")}

    // else {
    //   alert("Registration successful, check email for verification link")
    // }
  };
  return (
    <div>
      <form className="form" onSubmit={submitHandler}>
        <div>
          <h1>Create Account</h1>
        </div>
        {error && <MessageBox variant="danger">{error}</MessageBox>}
        {msg && <MessageBox variant="success">{msg}</MessageBox>}
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Enter name"
            name="name"
            required
            onChange={handleChange}
            value={data.name}
          ></input>
        </div>
        <div>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter email"
            name="email"
            required
            onChange={handleChange}
            value={data.email}
          ></input>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            name="password"
            required
            onChange={handleChange}
            value={data.password}
          ></input>
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Enter confirm password"
            // name="confirmPassword"
            required
            onChange={(e)=>setConfirmPasword(e.target.value)}
          ></input>
        </div>
        <div>
          <label />
          <button className="primary" type="submit">
            Register
          </button>
        </div>
        <div>
          <label />
          <div>
            Already have an account?{' '}
            <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
