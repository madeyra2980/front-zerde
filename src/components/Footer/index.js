import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">
              <FaGraduationCap className="footer-logo-icon" />
              SozLab
            </h3>
            <p className="footer-description">
              Современная система управления логопедическим центром.
              Упрощаем процесс планирования занятий, управления детьми и логопедами.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" className="social-link" aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Навигация</h4>
            <ul className="footer-links">
              <li><a href="/dashboard">Главная</a></li>
              <li><a href="/lessons">Занятия</a></li>
              <li><a href="/schedule">Расписание</a></li>
              <li><a href="/students">Дети</a></li>
              <li><a href="/teachers">Логопеды</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Поддержка</h4>
            <ul className="footer-links">
              <li><a href="/help">Помощь</a></li>
              <li><a href="/docs">Документация</a></li>
              <li><a href="/contact">Контакты</a></li>
              <li><a href="/api-test">Тест API</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Контакты</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>г. Семей, ул. Абая 107</span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span>+7 (747) 184-90-36</span>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>info@SozLab.kz</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} SozLab. Все права защищены.
            </p>
            <div className="footer-legal">
              <a href="/privacy">Политика конфиденциальности</a>
              <a href="/terms">Условия использования</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
