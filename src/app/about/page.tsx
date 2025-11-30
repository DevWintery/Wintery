import { Metadata } from "next";
import { FaEnvelope, FaGithub, FaDiscord } from "react-icons/fa6";
import { SiKakaotalk } from "react-icons/si";
import "./page.css";

export const metadata: Metadata = {
    title: "About | Wintery",
    description: "About Wintery Blog",
};

export default function About() {
    return (
        <main className="main-container">
            <section className="about-section">
                <h1>About Me</h1>
                <div className="about-content">
                    <p>
                        안녕하세요! Wintery 블로그에 오신 것을 환영합니다.
                    </p>
                    <p>
                        이곳은 제가 개발을 하면서 배운 내용, 겪었던 시행착오, 그리고 흥미로운 기술들에 대해 기록하는 공간입니다.
                    </p>

                    <div className="contact-section">
                        <h2>Contact</h2>
                        <div className="contact-grid">
                            <a href="mailto:dev.wintery@gmail.com" className="contact-card">
                                <div className="icon-wrapper email">
                                    <FaEnvelope />
                                </div>
                                <div className="contact-info">
                                    <span className="label">Email</span>
                                    <span className="value">dev.wintery@gmail.com</span>
                                </div>
                            </a>

                            <a href="https://github.com/DevWintery" target="_blank" rel="noopener noreferrer" className="contact-card">
                                <div className="icon-wrapper github">
                                    <FaGithub />
                                </div>
                                <div className="contact-info">
                                    <span className="label">GitHub</span>
                                    <span className="value">DevWintery</span>
                                </div>
                            </a>

                            <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" className="contact-card">
                                <div className="icon-wrapper discord">
                                    <FaDiscord />
                                </div>
                                <div className="contact-info">
                                    <span className="label">Discord</span>
                                    <span className="value">dev.wintery</span>
                                </div>
                            </a>

                            <a href="https://open.kakao.com/o/s..." target="_blank" rel="noopener noreferrer" className="contact-card">
                                <div className="icon-wrapper kakao">
                                    <SiKakaotalk />
                                </div>
                                <div className="contact-info">
                                    <span className="label">KakaoTalk</span>
                                    <span className="value">lua_script</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
