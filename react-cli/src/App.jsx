import React, { Suspense, lazy } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "antd";
import "./app.scss";

// 1、按需加载组件：需要使用 React.lazy、React.Suspense
// 2、使用 "魔法注释" 自定义 chunk 的输出文件名称
const Home = lazy(() => import(/* webpackChunkName: 'home' */ "./pages/Home"));
const About = lazy(() => import(/* webpackChunkName: 'about' */ "./pages/About"));

function App() {
  // 这个就是之前的 useHistory，真挺莫名其妙的！
  const navigate = useNavigate()
  const Welcome = () => <h1>Welcome!</h1>
  return (
    <div>
      <h1>App</h1>
      <Button type="primary" onClick={() => navigate('/')}>开始</Button>
      <br/><br/>
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
      <Suspense fallback={<div>loading...</div>}>
        {/* 这个 Routes 就是之前的 Switch 组件 */}
        <Routes>
          <Route path="/" element={<Welcome/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/about" element={<About/>} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
