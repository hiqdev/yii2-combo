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

use hiqdev\combo\Combo;
use Yii;

class ComboTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var Combo
     */
    protected $object;

    protected function setUp()
    {
        $this->object = Yii::createObject([
            'class'         => Combo::class,
            'name'          => 'test',
            'inputOptions'  => [
                'id'    => 'test',
            ],
        ]);
    }

    protected function tearDown()
    {
    }

    public function testConstruct()
    {
        $this->assertInstanceOf(Combo::class, $this->object);
    }
}
