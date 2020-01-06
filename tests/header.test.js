import { h } from 'preact';
import Header from '../src/components/header';
// See: https://github.com/preactjs/enzyme-adapter-preact-pure
import { shallow } from 'enzyme';

describe('Initial Test of the Header', () => {
	test('Header renders 0 nav items', () => {
		const context = shallow(<Header />);
		expect(context.find('h1').text()).toBe('Стенгазета ШуСуАрт');
		expect(context.find('Link').length).toBe(1);
	});
});
