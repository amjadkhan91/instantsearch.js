import sortBySelector from '../sort-by-selector';
import instantSearch from '../../../lib/main.js';

describe('sortBySelector call', () => {
  it('throws an exception when no options', () => {
    const container = document.createElement('div');
    expect(sortBySelector.bind(null, { container })).toThrow(/^Usage/);
  });

  it('throws an exception when no items', () => {
    const items = [];
    expect(sortBySelector.bind(null, { items })).toThrow(/^Usage/);
  });
});

describe('sortBySelector()', () => {
  let ReactDOM;
  let container;
  let items;
  let cssClasses;
  let widget;
  let helper;
  let results;

  beforeEach(() => {
    const instantSearchInstance = instantSearch({
      apiKey: '',
      appId: '',
      indexName: 'defaultIndex',
      createAlgoliaClient: () => ({}),
    });
    ReactDOM = { render: jest.fn() };

    sortBySelector.__Rewire__('render', ReactDOM.render);

    container = document.createElement('div');
    items = [
      { name: 'index-a', label: 'Index A' },
      { name: 'index-b', label: 'Index B' },
    ];
    cssClasses = {
      root: ['custom-root', 'cx'],
      select: 'custom-select',
      item: 'custom-item',
    };
    widget = sortBySelector({ container, items, cssClasses });
    helper = {
      getIndex: jest.fn().mockReturnValue('index-a'),
      setIndex: jest.fn().mockReturnThis(),
      search: jest.fn(),
    };

    results = {
      hits: [],
      nbHits: 0,
    };
    widget.init({ helper, instantSearchInstance });
  });

  it("doesn't configure anything", () => {
    expect(widget.getConfiguration).toEqual(undefined);
  });

  it('calls twice ReactDOM.render(<Selector props />, container)', () => {
    widget.render({ helper, results });
    widget.render({ helper, results });
    expect(ReactDOM.render).toHaveBeenCalledTimes(
      2,
      'ReactDOM.render called twice'
    );
    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[0][1]).toEqual(container);
    expect(ReactDOM.render.mock.calls[1][0]).toMatchSnapshot();
    expect(ReactDOM.render.mock.calls[1][1]).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = sortBySelector({
      container,
      items,
      transformItems: allItems =>
        allItems.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ helper, instantSearchInstance: {} });
    widget.render({ helper, results });

    expect(ReactDOM.render.mock.calls[0][0]).toMatchSnapshot();
  });

  it('sets the underlying index', () => {
    widget.setIndex('index-b');
    expect(helper.setIndex).toHaveBeenCalledTimes(1, 'setIndex called once');
    expect(helper.search).toHaveBeenCalledTimes(1, 'search called once');
  });

  it('should throw if there is no name attribute in a passed object', () => {
    items.length = 0;
    items.push({ label: 'Label without a name' });
    expect(() => {
      widget.init({ helper });
    }).toThrow(/Index index-a not present/);
  });

  it('must include the current index at initialization time', () => {
    helper.getIndex = jest.fn().mockReturnValue('non-existing-index');
    expect(() => {
      widget.init({ helper });
    }).toThrow(/Index non-existing-index not present/);
  });

  afterEach(() => {
    sortBySelector.__ResetDependency__('render');
  });
});
