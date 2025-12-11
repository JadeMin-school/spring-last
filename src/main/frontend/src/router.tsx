import {
	createBrowserRouter,
} from 'react-router';

import Home from "./routes/home";
import Upload from "./routes/upload";
import Editor from "./routes/editor";
import Login from "./routes/login";
import Register from "./routes/register";
import Projects from "./routes/projects";


export default createBrowserRouter([
	{
		path: "/",
		element: <Home/>,
	},
	{
		path: "/upload",
		element: <Upload/>
	},
	{
		path: "/editor/:fileName",
		element: <Editor/>
	},
	{
		path: "/login",
		element: <Login/>
	},
	{
		path: "/register",
		element: <Register/>
	},
	{
		path: "/projects",
		element: <Projects/>
	},
	{
		path: "/project/:id",
		element: <Editor/>
	}
]);