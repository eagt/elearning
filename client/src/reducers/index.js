import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import tenant from './tenant';
import course from './course';
import presentation from './presentation';
import quiz from './quiz';
import screenshot from './screenshot';
import tutorial from './tutorial';
import analytics from './analytics';
import profile from './profile';
import share from './share';
import collaboration from './collaboration';

export default combineReducers({
  alert,
  auth,
  tenant,
  course,
  presentation,
  quiz,
  screenshot,
  tutorial,
  analytics,
  profile,
  share,
  collaboration
});