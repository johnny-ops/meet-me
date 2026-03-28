# Changelog

All notable changes to MeetMe will be documented in this file.

## [2.0.0] - 2024

### Added
- ✋ **Raise Hand Feature** - Participants can raise their hand to get attention
- ⛶ **Fullscreen Mode** - Enter fullscreen for immersive meeting experience
- 🎨 **Enhanced UI Animations** - Smooth transitions, fades, and hover effects
- 📱 **Improved Mobile Responsiveness** - Better controls and layout on mobile devices
- 🖥️ **Dual-Stream Screen Sharing** - Show both screen and camera simultaneously
- 🔄 **Better State Management** - Improved React state handling for screen sharing
- 📊 **Connection Quality Monitoring** - Track connection status
- 🎯 **Visual Indicators** - Clear badges for raised hands and screen sharing
- 🌐 **Fixed 404 Routing** - Direct room links now work properly
- 📝 **Comprehensive Logging** - Better debugging with console logs

### Improved
- **Video Grid Layout** - Optimized for different participant counts
- **Control Bar** - Added new buttons with tooltips
- **Screen Sharing** - Fixed display issues and added PIP camera view
- **Performance** - Reduced re-renders and optimized state updates
- **Code Organization** - Better component structure and separation of concerns

### Fixed
- Screen sharing not displaying properly
- 404 errors on shared meeting links
- State synchronization issues
- Mobile button visibility
- Fullscreen exit handling

### Technical Changes
- Added `vercel.json` for proper routing
- Implemented separate WebRTC connections for screen streams
- Added socket events for raised hands
- Enhanced error handling and logging
- Improved CSS with custom animations
- Added glassmorphism effects

## [1.0.0] - 2024

### Initial Release
- Basic video conferencing functionality
- Guest user system
- Screen sharing
- Real-time chat
- Recording feature
- Participants list
- Mute/unmute controls
- Camera on/off
- Black and white UI theme

---

## Upcoming Features

- [ ] Virtual backgrounds
- [ ] Breakout rooms
- [ ] Polls and reactions
- [ ] Whiteboard collaboration
- [ ] Meeting scheduling
- [ ] Cloud recording
- [ ] End-to-end encryption
- [ ] Custom room names
- [ ] Meeting passwords
- [ ] Waiting room
