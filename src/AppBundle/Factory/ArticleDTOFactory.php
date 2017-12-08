<?php

namespace AppBundle\Factory;

use Symfony\Bridge\Doctrine\ManagerRegistry;
use AppBundle\DTO\ArticleMainDTO;
use AppBundle\DTO\ArticleModalDTO;
use AppBundle\DTO\ArticleCollectionDTO;
use AppBundle\Entity\ArticleType;
use AppBundle\Entity\ArticleSubType;
use AppBundle\DTO\ArticleAbstractDTO;


class ArticleDTOFactory
{
    
    /** ManagerRegistry $doctrine */
    private $doctrine;
    /** ArticleDTOInterface $articleDTO */
    private $articleDTO;
    /** EntityRepository $typeRepo */
    private $typeRepo;
    /** EntityRepository $subTypeRepo */
    private $subTypeRepo;
    
    /**
     * @param ManagerRegistry $doctrine
     */
    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
        $this->typeRepo = $this->doctrine->getManager()->getRepository(ArticleType::class);
        $this->subTypeRepo = $this->doctrine->getManager()->getRepository(ArticleSubType::class);
    }
    
    /**
     * create a new ArticleDTO object : flag can be main or modal (the modal type has special values for js replacement)
     * @param string $flag
     * @return ArticleAbstractDTO
     */
    public function newInstance($flag = "main")
    {
        if($flag === "main"){$this->articleDTO = new ArticleMainDTO();}
        elseif($flag === "modal"){$this->articleDTO = new ArticleModalDTO();}
        elseif($flag === "main_collection"){$this->articleDTO = new ArticleCollectionDTO();}
        $this->setData($flag);
        return $this->articleDTO;
    }
    
    /**
     * @param string $flag
     * @return self
     */
    public function setData($flag = "main")
    {
        if($flag === "main"){$this->setDataMain();}
        elseif($flag === "modal"){$this->setDataModal();}
        elseif($flag === "main_collection"){$this->setDataMainCollection();}
        return $this;
    }
    
    /**
     * @return self
     */
    private function setDataMain()
    {
        /** ArticleType $type */
        $type = $this->typeRepo->find(ArticleType::EVENT);
        /** ArticleSubType $subType */
        $subType = $this->typeRepo->find(ArticleSubType::EVENT_LONG);
        
        /**
         * ArticleMainDTO $this->articleDTO
         */
        $this->articleDTO->type = $type;
        $this->articleDTO->subType = $subType;
    }
    
    /**
     * @return self
     */
    private function setDataModal()
    {
        /** ArticleType $type */
        $type = $this->typeRepo->find(ArticleType::EVENT);
        /** ArticleSubType $subType */
        $subType = $this->typeRepo->find(ArticleSubType::EVENT_SHORT);
        
        /**
         * ArticleModalDTO $this->articleDTO
         */
        $this->articleDTO->type = $type;
        $this->articleDTO->subType=$subType;
        $this->articleDTO->title = "<_TITLE_>";
        $this->articleDTO->abstract="<_ABSTRACT_>";
    }
    
    /**
     * @return self
     */
    private function setDataMainCollection()
    {
        /** ArticleType $type */
        $type = $this->typeRepo->find(ArticleType::EVENT);
        /** ArticleSubType $subType */
        $subType = $this->typeRepo->find(ArticleSubType::EVENT_LONG);
        
        /**
         * ArticleMainDTO $this->articleDTO
         */
        $this->articleDTO->type = $type;
        $this->articleDTO->subType = $subType;
    }
     
}