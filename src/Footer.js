import React from 'react';
import './Footer.css';
import { AiFillGithub, AiFillYoutube } from 'react-icons/ai';
import { FaDiscord, FaPaypal } from 'react-icons/fa';
import SiteThemeSelector from './SiteThemeSelector';


const Footer = () => {
  
  return (
    <footer className="appFooter">
      <div className="footer-container left">
          <SiteThemeSelector />
      </div>
      <div className="footer-container center">
        <a target="_blank" rel="noreferrer" href="https://www.github.com" className='nav'><AiFillGithub style={{fontSize: "2.5em"}} /></a>
        <a target="_blank" rel="noreferrer" href="/#" className='nav'><FaPaypal style={{fontSize: "2.5em"}} /></a>
        <a target="_blank" rel="noreferrer" href="https://www.discord.com" className='nav'><FaDiscord style={{fontSize: "2.5em"}} /></a>
        <a target="_blank" rel="noreferrer" href="https://www.youtube.com" className='nav'><AiFillYoutube style={{fontSize: "2.5em"}} /></a>
      </div>
    </footer>
  );
}

export default Footer;

