import React, { useEffect, Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CreateCourse from './components/courses/CreateCourse';
import EditCourse from './components/courses/EditCourse';
import CourseDetails from './components/courses/CourseDetails';
import CreatePresentation from './components/presentations/CreatePresentation';
import EditPresentation from './components/presentations/EditPresentation';
import PresentationDetails from './components/presentations/PresentationDetails';
import CreateQuiz from './components/quizzes/CreateQuiz';
import EditQuiz from './components/quizzes/EditQuiz';
import QuizDetails from './components/quizzes/QuizDetails';
import TakeQuiz from './components/quizzes/TakeQuiz';
import ScreenshotCapture from './components/screenshots/ScreenshotCapture';
import ScreenshotEditor from './components/screenshots/ScreenshotEditor';
import CreateTutorial from './components/tutorials/CreateTutorial';
import EditTutorial from './components/tutorials/EditTutorial';
import TutorialDetails from './components/tutorials/TutorialDetails';
import ViewTutorial from './components/tutorials/ViewTutorial';
import PrivateRoute from './components/routing/PrivateRoute';
import Alert from './components/layout/Alert';
import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <div className="container">
            <Alert />
            <Switch>
              <Route exact path="/" component={Landing} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute exact path="/courses/create" component={CreateCourse} />
              <PrivateRoute exact path="/courses/:id/edit" component={EditCourse} />
              <PrivateRoute exact path="/courses/:id" component={CourseDetails} />
              <PrivateRoute exact path="/presentations/create" component={CreatePresentation} />
              <PrivateRoute exact path="/presentations/:id/edit" component={EditPresentation} />
              <PrivateRoute exact path="/presentations/:id" component={PresentationDetails} />
              <PrivateRoute exact path="/quizzes/create" component={CreateQuiz} />
              <PrivateRoute exact path="/quizzes/:id/edit" component={EditQuiz} />
              <PrivateRoute exact path="/quizzes/:id" component={QuizDetails} />
              <PrivateRoute exact path="/quizzes/:id/take" component={TakeQuiz} />
              <PrivateRoute exact path="/screenshots/capture" component={ScreenshotCapture} />
              <PrivateRoute exact path="/screenshots/:id/edit" component={ScreenshotEditor} />
              <PrivateRoute exact path="/tutorials/create" component={CreateTutorial} />
              <PrivateRoute exact path="/tutorials/:id/edit" component={EditTutorial} />
              <PrivateRoute exact path="/tutorials/:id" component={TutorialDetails} />
              <PrivateRoute exact path="/tutorials/:id/view" component={ViewTutorial} />
              <Redirect to="/" />
            </Switch>
          </div>
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;