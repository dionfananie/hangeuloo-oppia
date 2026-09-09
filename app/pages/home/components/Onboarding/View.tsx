import { Form } from "react-router";
import Icon from "../Icon";
import { levelNames, levelDescriptions } from "../../helpers";

function Onboarding({ userName }: { userName: string }) {
	return <main className="onboarding-page"><section className="onboarding-card">
		<a className="brand" href="/"><span className="brand-mark" aria-hidden="true"><span>ㅎ</span></span><span className="brand-name">Hangeuloo</span></a>
		<div className="onboarding-heading"><span className="auth-pill"><Icon name="sparkles" size={15} /> 2 MINUTE SETUP</span><h1>반가워요, {userName.split(" ")[0]}!</h1><p>Tell us how you want to learn. You can change these choices later.</p></div>
		<Form method="post" className="onboarding-form">
			<input type="hidden" name="intent" value="onboarding" />
			<fieldset><legend>Guidance language <small>Bahasa pengantar</small></legend><div className="option-row"><label><input type="radio" name="guideLanguage" value="id" defaultChecked /><span>Bahasa Indonesia</span></label><label><input type="radio" name="guideLanguage" value="en" /><span>English</span></label></div></fieldset>
			<fieldset><legend>Your main goal</legend><div className="option-grid"><label><input type="radio" name="goal" value="conversation" defaultChecked /><span>Everyday conversation</span></label><label><input type="radio" name="goal" value="job" /><span>Job interview</span></label><label><input type="radio" name="goal" value="topik" /><span>TOPIK study</span></label><label><input type="radio" name="goal" value="travel" /><span>Travel</span></label></div></fieldset>
			<fieldset><legend>Starting level</legend><div className="level-options">{levelNames.map((name, level) => <label key={name}><input type="radio" name="level" value={level} defaultChecked={level === 0} /><span><b>Level {level}</b><strong>{name}</strong><small>{levelDescriptions[level]}</small></span></label>)}</div></fieldset>
			<fieldset><legend>Topics you enjoy <small>Choose any</small></legend><div className="chip-options">{["K-culture", "Food", "Travel", "School", "Work", "Daily life"].map((interest) => <label key={interest}><input type="checkbox" name="interests" value={interest} /><span>{interest}</span></label>)}</div></fieldset>
			<label className="target-field">Daily practice target<select name="dailyTarget" defaultValue="10"><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="20">20 minutes</option></select></label>
			<button className="check-button" type="submit">Build my learning path <Icon name="arrow" size={17} /></button>
		</Form>
	</section></main>;
}

export default Onboarding;
