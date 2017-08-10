<?php
/**
 * Combo widget for Yii2
 *
 * @link      https://github.com/hiqdev/yii2-combo
 * @package   yii2-combo
 * @license   BSD-3-Clause
 * @copyright Copyright (c) 2015-2017, HiQDev (http://hiqdev.com/)
 */

namespace hiqdev\combo\tests\unit;

use hiqdev\combo\StaticCombo;
use Yii;

class StaticComboTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var StaticCombo
     */
    protected $object;

    protected $data = [
        'test' => 'test',
    ];

    protected function setUp()
    {
        $this->object = Yii::createObject([
            'class' => StaticCombo::class,
            'data' => $this->data,
            'inputOptions' => [
                'id' => 'test',
            ],
        ]);
    }

    protected function tearDown()
    {
    }

    public function testConstruct()
    {
        $this->assertInstanceOf(StaticCombo::class, $this->object);
    }
}
