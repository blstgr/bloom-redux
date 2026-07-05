module.exports = {
  launchCamera: jest.fn(() => Promise.resolve({ didCancel: true })),
};
