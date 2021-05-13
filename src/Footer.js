import React from 'react';
import './Footer.css';
import { AiFillGithub, AiFillYoutube } from 'react-icons/ai';
import { FaDiscord, FaPaypal } from 'react-icons/fa';


const Footer = () => {
  
  return (
    <footer className="appFooter">
      <div className="navigationContainer">
        <a target="_blank" rel="noreferrer" href="https://www.github.com" className='nav'><AiFillGithub style={{fontSize: "2.5em"}} /></a>
        <a target="_blank" rel="noreferrer" href="/#" className='nav'><FaPaypal style={{fontSize: "2.5em"}} /></a>
        <a target="_blank" rel="noreferrer" href="https://www.discord.com" className='nav'><FaDiscord style={{fontSize: "2.5em"}} /></a>
        <a target="_blank" rel="noreferrer" href="https://www.youtube.com" className='nav'><AiFillYoutube style={{fontSize: "2.5em"}} /></a>
      </div>
    </footer>
  );
}

export default Footer;

