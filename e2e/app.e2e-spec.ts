import { ESNaviPage } from './app.po';

describe('es-navi App', () => {
  let page: ESNaviPage;

  beforeEach(() => {
    page = new ESNaviPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
