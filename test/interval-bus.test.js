import test from 'ava';
import IntervalBus from '../helpers/interval-bus';
import { intervalFunctionExists } from '../helpers/interval-bus';

function logTest() {
  console.log("Test!");
}

test('Add a 10 second interval function', t => {
  t.is(intervalFunctionExists(logTest), false);
  IntervalBus.set(logTest, 10);
  t.not(intervalFunctionExists(logTest), false);
});

test('Remove an interval function', t => {
  t.not(intervalFunctionExists(logTest), false);
  IntervalBus.clear(logTest);
  t.is(intervalFunctionExists(logTest), false);
});

test('Change a 10 second interval function to 60', t => {
  t.is(intervalFunctionExists(logTest), false);
  IntervalBus.set(logTest, 10);
  t.is(intervalFunctionExists(logTest), '10');
  IntervalBus.set(logTest, 60);
  t.is(intervalFunctionExists(logTest), '60');
});

test('Setting an invalid duration', t => {
  let exception = false;

  try {
    IntervalBus.set(logTest, 12345);
  } catch(error) {
    exception = true;
  }

  t.truthy(exception);
});

test('Getting the best interval', t => {
  t.is(IntervalBus.bestInterval(0.1), '10');
  t.is(IntervalBus.bestInterval(44), '60');
  t.is(IntervalBus.bestInterval(90), '180');
});
