<?php
/**
 * Created by PhpStorm.
 * User: ajeelomen-1
 * Date: 22/03/18
 * Time: 22:59
 */

namespace AppBundle\DTO;


use AppBundle\Entity\ArticleType;
use AppBundle\Mediator\DTOMediator;
use AppBundle\Utils\HDate;

class ArticleDTO extends EntityMutableDTO
{
    /** @var integer */
    protected $entityId;
    /** @var string */
    protected $title;
    /** @var string */
    protected $abstract;
    /** @var ArticleType */
    protected $type;
    /** @var HDate */
    protected $beginHDate;
    /** @var HDate */
    protected $endHDate;
    /** @var boolean */
    protected $hasEndDate;
    /** @var DTOMediator */
    protected $mediator;

    /**
     * ArticleDTO constructor.
     */
    public function __construct()
    {
    }

    /**
     * @return int
     */
    public function getEntityId()
    {
        return $this->entityId;
    }

    /**
     * @param int
     * @return self
     */
    public function setEntityId($entityId)
    {
        $this->entityId = $entityId;
        return $this;
    }

    /**
     * @return HDate
     */
    public function getBeginHDate()
    {
        return $this->beginHDate;
    }

    /**
     * @param HDate $hDate
     * @return self
     */
   public function setBeginHDate($hDate)
    {
        $this->beginHDate=$hDate;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('beginHDate');
        return $this;
    }

    /**
     * @return HDate
     */
    public function getEndHDate()
    {
        return $this->endHDate;
    }

    /**
     * @param HDate $hDate
     * @return self
     */
    public function setEndHDate($hDate)
    {
        $this->endHDate = $hDate;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('endHDate');
        return $this;
    }

    /**
     * @return boolean
     */
    public function getHasEndDate()
    {
        return $this->hasEndDate;
    }

    /**
     * @param bool $hasEndDate
     * @return self
     */
    public function setHasEndDate($hasEndDate)
    {
        $this->hasEndDate = $hasEndDate;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('hasEndDate');
        return $this;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param string $title
     * @return self
     */
    public function setTitle($title)
    {
        $this->title = $title;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('title');
        return $this;
    }

    /**
     * @return mixed
     */
    public function getAbstract()
    {
        return $this->abstract;
    }

    /**
     * @param string $abstract
     * @return self
     */
    public function setAbstract($abstract)
    {
        $this->abstract= $abstract;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('abstract');
        return $this;
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param ArticleType $type
     * @return self
     */
    public function setType($type)
    {
        $this->type = $type;
        if($this->mediator !== null) $this->mediator->notifyChangeOfProperty('type');
        return $this;
    }
}