# Apt - Alternative Piwigo Theme

Apt is a [Piwigo](https://piwigo.org/) theme made to feel more clean and responsive, akin Apple or Google photos.

# Status

Apt is currently in its demo / alpha phase and cannot cover the full range of needs for a Piwigo theme, so I would discourage using it unless you are actively in development.

- `2026-03-28`: In this initial version, one can view top level albums and a list of the images directly within those top level albums on a timeline.

# Goals

My current goals are around my perceived issues with current themes available:

- **Quick Navigation & Timelines:** My biggest issues with both the Piwigo themes is that it is difficult to navigate large photosets with thousands of photos along a timeline, like your photo reel on your phone. Particularly the Android app it is a nightmare to go back even a couple hundred photos.
- **Responsiveness:** Relying on PHP and Smarty creates a lag between each action that can feel uncomfotable and tiring. It doesn't feel very modern. This should be a single page app, where possible.
- **Clean UI:** Many of the other themes either have cluttered or outdated looking UIs, giving it less of a clunky feel.

### Problems with this approach

I have run into a number of issues already with this task:

- **Incomplete API:** I cannot get all the data I need out of the API all the time. So far: `pwg.categories.getImages` does not include `rotation` of images, making the height and width backwards on occasion; `pwg.session.login` does not allow for `remember_me`.
- **Smarty Layout:** In order to maintain compatibility with other UI, this app should be able to generate the correct page for any given URL.
- **Plugins:** Many plugins will add information to the UI in Smarty. This not only needs to generate when you first load the page, but also when you navigate within the SPA.
