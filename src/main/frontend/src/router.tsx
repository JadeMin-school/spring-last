import {
	createBrowserRouter,
} from 'react-router';

import Home from "./routes/home";
import Upload from "./routes/upload";
import Editor from "./routes/editor";


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
	}
]);