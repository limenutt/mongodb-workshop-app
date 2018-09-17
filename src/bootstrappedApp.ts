/**
 * A wrapper for the app that installs source map support
 * Used when running in a normal node environment as opposed to through ts-node
 */
import { install as installSourceMapSupport } from 'source-map-support';
installSourceMapSupport();
// tslint:disable-next-line:no-import-side-effect
import './app';
