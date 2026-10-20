import {React} from 'react';
import './Loading.css';

const Loading = ()=>{
    return (<>
        <div className="loader-overlay">
              <div className="spinner"></div>
            </div>
    </>);
}

export default Loading;