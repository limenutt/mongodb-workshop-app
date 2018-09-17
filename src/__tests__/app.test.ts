import { logger } from '../logger';
/**
 * Dummy tests
 */
describe('Dummy test suite', () => {
  describe('Dummy test sub suite A', () => {
    beforeAll(() => {
      logger.info('beforeAll in suite A');
    });
    afterAll(() => {
      logger.info('afterAll in suite A');
    });
    beforeEach(() => {
      logger.info('beforeEach in suite A');
    });
    it('should do something useful', () => {
      expect(true).toEqual(true);
    });
  });
  describe('Dummy test sub suite B', () => {
    beforeAll(() => {
      logger.info('beforeAll in suite B');
    });
    afterAll(() => {
      logger.info('afterAll in suite B');
    });
    beforeEach(() => {
      logger.info('beforeEach in suite B');
    });
    it('you should write some tests', () => {
      expect(true).toEqual(false);
    });
  });
});
