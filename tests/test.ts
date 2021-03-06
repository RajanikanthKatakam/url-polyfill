import { Driver } from './classes/Driver';
import { Async } from './classes/Async';
import { Tester } from './classes/Tester';


(function example() {
  const config = require('./config.json');
  const tester = new Tester(config.testServer);

  return tester.runForMany([
    Driver.EDGE,
    Driver.CHROME,
    // Driver.FIREFOX,
    // Driver.OPERA,
    Driver.IE
  ], async (driver: Driver) => {

    await driver.driver.manage().setTimeouts({
      pageLoad: 300000,
      script: 300000,
    });
    await driver.navigate(config.testHost);

    await Async.$delay(500);

    await tester.test('Test URL', () =>  {
      return driver.executeScript(`
        var url = new URL('https://www.yahoo.com:80/?fr=yset_ie_syc_oracle&type=orcl_hpset#page0');

        if(url.hash !== '#page0') throw new Error('Invalid hash : ' + url.hash);
        if(url.host !== 'www.yahoo.com:80') throw new Error('Invalid host : ' + url.host);
        if(url.hostname !== 'www.yahoo.com') throw new Error('Invalid hostname : ' + url.hostname);
        if(url.href !== 'https://www.yahoo.com:80/?fr=yset_ie_syc_oracle&type=orcl_hpset#page0') throw new Error('Invalid href : ' + url.href);
        if(url.origin !== 'https://www.yahoo.com:80') throw new Error('Invalid origin : ' + url.origin);
        if(url.pathname !== '/') throw new Error('Invalid pathname : ' + url.pathname);
        if(url.port !== '80') throw new Error('Invalid port : ' + url.port);
        if(url.protocol !== 'https:') throw new Error('Invalid protocol : ' + url.protocol);
        if(url.search !== '?fr=yset_ie_syc_oracle&type=orcl_hpset') throw new Error('Invalid search : ' + url.search);

        url.searchParams.append('page', 1);
        if(url.search !== '?fr=yset_ie_syc_oracle&type=orcl_hpset&page=1') throw new Error('Invalid search (append page 1) : ' + url.search);

        url.searchParams.delete('type')
        if(url.search !== '?fr=yset_ie_syc_oracle&page=1') throw new Error('Invalid search (delete type) : ' + url.search);

        return url;
      `);
    });

    await tester.test('Test URL with base', () => {
      return driver.executeScript(`
        var url = new URL('test', 'http://www.example.com/base');
        
        if(url.host !== 'www.example.com') throw new Error('Invalid host : ' + url.host);
        if(url.hostname !== 'www.example.com') throw new Error('Invalid hostname : ' + url.hostname);
        if(url.href !== 'http://www.example.com/test') throw new Error('Invalid href : ' + url.href);
        if(url.pathname !== '/test') throw new Error('Invalid pathname : ' + url.pathname);
        if(url.protocol !== 'http:') throw new Error('Invalid protocol : ' + url.protocol);
        if(url.search !== '') throw new Error('Invalid search : ' + url.search);
        
        return url;
      `);
    });

    await tester.test('Test pathname variations', () => {
      return driver.executeScript(`
        var url = new URL('test/long/path.html', 'http://www.example.com');
        if(url.pathname !== '/test/long/path.html') throw new Error('Invalid pathname : ' + url.pathname);
        url.pathname = 'a/b 1'
        if(url.pathname !== '/a/b%201') throw new Error('Invalid pathname : ' + url.pathname);
        return url;
      `);
    });

    await tester.test('Ensure url.href does\'nt finish with ? if url.search is empty', () => {
      return driver.executeScript(`
        var url = new URL('https://www.example.com/');
        url.searchParams.delete('foo');
        if(url.toString() !== 'https://www.example.com/') throw new Error('Invalid url : ' + url.toString());
      `);
    });

    await tester.test('URL SearchParams should have spaces encoded as "+"', () => {
      return driver.executeScript(`
        var url = new URL('https://www.example.com/');
        url.searchParams.set('foo', 'value with spaces');
        if(url.toString() !== 'https://www.example.com/?foo=value+with+spaces') throw new Error('Invalid url : ' + url.toString());

        var url = new URL('https://www.example.com/?foo=another+value+with+spaces');
        var fooParam = url.searchParams.get('foo');
        if(fooParam !== 'another value with spaces') throw new Error('Invalid "foo" param value : ' + fooParam);
      `);
    });

    await tester.test('Url Protocol should control the visibility of port in origin', () => {
      return driver.executeScript(`
        var url = new URL('https://www.example.com:443'); // No port for https on 443
        var url2 = new URL('http://www.example.com:8080'); // Port for http on 8080
        var url3 = new URL('https://www.example.com:80'); // port for https on 80
        
        if (url.origin !== 'https://www.example.com') throw new Error('Origin value is not correct ' + url.origin);
        if (url2.origin !== 'http://www.example.com:8080') throw new Error('Origin value is not correct ' + url2.origin);
        if (url3.origin !== 'https://www.example.com:80') throw new Error('Origin value is not correct ' + url3.origin);
      `);
    });

  });

})().catch(_ => console.log('ERROR: ', _));