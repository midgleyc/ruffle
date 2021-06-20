// Compile with:
//  mtasc -main -header 200:150:30 Test.as -swf test.swf 
class Test {
    static function main(current) {
		trace("// text field with width 100");
		this.createTextField("title_txt", 1, 0, 0, 100, 20);
		trace("// text: A test for hscroll.");
		title_txt.text = "A test for hscroll.";
		trace("// title_txt.maxhscroll");
		trace(title_txt.maxhscroll);
		trace("// title_txt.hscroll = -10");
		title_txt.hscroll = -10;
		trace(title_txt.hscroll);
		trace("// title_txt.hscroll = 10");
		title_txt.hscroll = 10;
		trace(title_txt.hscroll);
		trace("// text: A long enough test for hscroll.");
		title_txt.text = "A long enough test for hscroll.";
		trace("// title_txt.maxhscroll");
		trace(title_txt.maxhscroll);
		trace("// title_txt.hscroll = -10");
		title_txt.hscroll = -10;
		trace(title_txt.hscroll);
		trace("// title_txt.hscroll = 10");
		title_txt.hscroll = 10;
		trace(title_txt.hscroll);
		trace("// title_txt.hscroll = 100");
		title_txt.hscroll = 100;
		trace(title_txt.hscroll);
		trace("// title_txt.hscroll = null");
		title_txt.hscroll = null;
		trace(title_txt.hscroll);
		trace("// title_txt.hscroll = undefined");
		title_txt.hscroll = undefined;
		trace(title_txt.hscroll);
    }
}
