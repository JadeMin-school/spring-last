import {
	createBrowserRouter,
} from 'react-router';

import Home from "./routes/Home.tsx";


export default createBrowserRouter([
	{
		path: "/",
		Component: Home,
	}
]);